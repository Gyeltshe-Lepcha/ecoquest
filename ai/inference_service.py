import os
import json
import shutil
import tempfile
from pathlib import Path

import h5py
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile
from PIL import Image

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if load_dotenv:
    load_dotenv(PROJECT_ROOT / ".env")
    load_dotenv(PROJECT_ROOT / ".env.local", override=True)

MODEL_PATH = Path(os.getenv("WASTE_MODEL_PATH", "D:/EcoQuest/ai/models/waste_model2.h5"))
LABELS = [label.strip().lower() for label in os.getenv("WASTE_MODEL_LABELS", "paper,plastic,bottle,unknown").split(",")]
UNKNOWN_LABEL = "unknown"
UNKNOWN_CONFIDENCE_THRESHOLD = float(os.getenv("UNKNOWN_CONFIDENCE_THRESHOLD", "50"))

app = FastAPI(title="EcoQuest Waste Classifier")
model = None


def strip_quantization_config(value):
    if isinstance(value, dict):
        value.pop("quantization_config", None)
        for child in value.values():
            strip_quantization_config(child)
    elif isinstance(value, list):
        for child in value:
            strip_quantization_config(child)


def sanitized_h5_copy(source_path: Path):
    target_path = Path(tempfile.gettempdir()) / f"ecoquest_sanitized_{source_path.name}"
    shutil.copy2(source_path, target_path)

    with h5py.File(target_path, "r+") as h5_file:
        raw_config = h5_file.attrs.get("model_config")
        if raw_config is None:
            return target_path

        if isinstance(raw_config, bytes):
            raw_config = raw_config.decode("utf-8")

        model_config = json.loads(raw_config)
        strip_quantization_config(model_config)
        h5_file.attrs.modify("model_config", json.dumps(model_config).encode("utf-8"))

    return target_path


def load_model():
    global model
    if model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
        try:
            model = tf.keras.models.load_model(MODEL_PATH, compile=False)
        except (TypeError, ValueError) as exc:
            if "quantization_config" not in str(exc):
                raise
            model = tf.keras.models.load_model(sanitized_h5_copy(MODEL_PATH), compile=False)
    return model


def model_image_size(keras_model):
    input_shape = keras_model.input_shape
    if isinstance(input_shape, list):
        input_shape = input_shape[0]

    height = input_shape[1] if len(input_shape) > 2 and input_shape[1] else 224
    width = input_shape[2] if len(input_shape) > 3 and input_shape[2] else height
    return int(width), int(height)


def preprocess_image(image: Image.Image, keras_model):
    width, height = model_image_size(keras_model)
    image = image.convert("RGB").resize((width, height))
    array = np.asarray(image, dtype=np.float32) / 255.0
    return np.expand_dims(array, axis=0)


def labels_for_output_size(output_size):
    if output_size == len(LABELS):
        return LABELS

    labels_without_unknown = [label for label in LABELS if label != UNKNOWN_LABEL]
    if UNKNOWN_LABEL in LABELS and output_size == len(labels_without_unknown):
        return labels_without_unknown

    return [
        LABELS[index] if index < len(LABELS) else f"class_{index}"
        for index in range(output_size)
    ]


def decode_prediction(raw_prediction):
    prediction = np.asarray(raw_prediction).reshape(-1)
    label_names = labels_for_output_size(2 if prediction.size == 1 else prediction.size)

    if prediction.size == 1:
        probability = float(prediction[0])
        index = 1 if probability >= 0.5 else 0
        confidence = probability if index == 1 else 1 - probability
    else:
        index = int(np.argmax(prediction))
        confidence = float(prediction[index])

    label = label_names[index] if index < len(label_names) else f"class_{index}"
    confidence_pct = round(confidence * 100, 2)

    if UNKNOWN_LABEL in LABELS and UNKNOWN_LABEL not in label_names and confidence_pct < UNKNOWN_CONFIDENCE_THRESHOLD:
        label = UNKNOWN_LABEL
        confidence_pct = round(100 - confidence_pct, 2)

    probabilities = {
        label_names[class_index] if class_index < len(label_names) else f"class_{class_index}": round(float(score) * 100, 2)
        for class_index, score in enumerate(prediction)
    }

    if UNKNOWN_LABEL in LABELS and UNKNOWN_LABEL not in probabilities:
        probabilities[UNKNOWN_LABEL] = max(0, round(100 - max(probabilities.values()), 2)) if probabilities else 0

    return label, confidence_pct, probabilities


@app.get("/health")
def health():
    return {
        "ok": MODEL_PATH.exists(),
        "model_path": str(MODEL_PATH),
        "labels": LABELS,
        "unknown_confidence_threshold": UNKNOWN_CONFIDENCE_THRESHOLD,
        "input_shape": getattr(model, "input_shape", None) if model is not None else None,
        "output_shape": getattr(model, "output_shape", None) if model is not None else None,
    }


@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    keras_model = load_model()
    pil_image = Image.open(image.file)
    batch = preprocess_image(pil_image, keras_model)
    raw_prediction = keras_model.predict(batch, verbose=0)
    label, confidence_pct, probabilities = decode_prediction(raw_prediction)

    return {
        "label": label,
        "confidence_pct": confidence_pct,
        "probabilities": probabilities,
        "source": "waste_model2.h5",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("inference_service:app", host="127.0.0.1", port=8000, reload=True)
