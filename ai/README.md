# EcoQuest AI Model Service

Your trained file `C:/Users/Lenovo/Downloads/waste_model2.h5` should not be stored in Supabase. Supabase stores the app data: proof image URL, predicted waste type, confidence, review status, points, bins, users, badges, and leaderboard rows.

Use this service when you are ready to connect real AI verification:

1. Copy the model into `D:/EcoQuest/ai/models/waste_model2.h5`.
2. Create and activate a Python virtual environment.
3. Install the dependencies from `ai/requirements.txt`.
4. Run `python ai/inference_service.py`.
5. Keep `AI_INFERENCE_URL=http://127.0.0.1:8000` in `.env.local`.

The Next.js route `POST /api/verify` will send uploaded proof images to this service, receive `{ label, confidence_pct }`, and save the result to Supabase when Supabase credentials are configured.

If your model uses different class names, set:

```powershell
$env:WASTE_MODEL_LABELS = "paper,plastic,bottle,unknown"
```

The current `waste_model2.h5` file outputs 3 classes. With the labels above, EcoQuest maps those outputs to `paper`, `plastic`, and `bottle`, then uses `unknown` when the top confidence is below `UNKNOWN_CONFIDENCE_THRESHOLD` 50 by default. If you retrain the model with 4 output classes, the service will map all four labels directly.

If your model needs special preprocessing beyond resize + RGB + 0-1 scaling, update `preprocess_image()` in `ai/inference_service.py`.
