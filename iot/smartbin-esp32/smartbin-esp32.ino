// #include <WiFi.h>
// #include <HTTPClient.h>
// #include <WebServer.h>
// #include <ESP32Servo.h>

// // ===================== WiFi Settings =====================
// // Fill these locally before flashing. Keep real Wi-Fi credentials out of GitHub.
// const char* ssid = "YOUR_WIFI_NAME";
// const char* password = "YOUR_WIFI_PASSWORD";

// // ESP32-CAM capture URL
// // Replace with the IP shown in ESP32-CAM Serial Monitor
// String esp32CamCaptureUrl = "http://172.20.10.5/capture";

// // Backend URL
// // Replace with your laptop/backend IP
// String backendUrl = "http://172.20.10.3:3001/log-waste";
// String deviceToken = "";

// // Set false if your backend is not ready yet
// const bool USE_BACKEND = true;

// // ===================== Pin Connections =====================
// #define TRIG_PIN 18
// #define ECHO_PIN 19

// #define IR_PIN 27

// #define SERVO_PIN 25

// #define GREEN_LED_PIN 26
// #define RED_LED_PIN 33

// #define BUZZER_PIN 32

// // ===================== Settings =====================
// const int PERSON_DISTANCE_CM = 25;
// const int FULL_WASTE_LIMIT = 20;

// const int LID_CLOSED_ANGLE = 0;
// const int LID_OPEN_ANGLE = 90;

// const unsigned long CLOSE_DELAY_AFTER_LEAVE = 5000;
// const unsigned long IR_DEBOUNCE_TIME = 1000;

// const int IR_OBJECT_DETECTED = LOW;

// Servo lidServo;
// WebServer server(80);

// int wasteCount = 0;
// bool binFull = false;
// bool lidOpen = false;
// bool challengeArmed = false;
// bool lidOpenedByUltrasonic = false;
// bool lastBackendReached = false;
// bool commandServerStarted = false;

// String activeMissionId = "";
// String activeChallengeId = "";
// String activeExpectedLabel = "";
// String activeUserId = "USR-0042";

// unsigned long lastWasteDetectTime = 0;
// unsigned long obstacleLeftTime = 0;

// // ===================== WiFi Function =====================
// void connectWiFi() {
//   WiFi.mode(WIFI_STA);
//   WiFi.begin(ssid, password);

//   Serial.print("Connecting to WiFi");

//   int attempts = 0;

//   while (WiFi.status() != WL_CONNECTED && attempts < 30) {
//     delay(500);
//     Serial.print(".");
//     attempts++;
//   }

//   Serial.println();

//   if (WiFi.status() == WL_CONNECTED) {
//     Serial.println("WiFi connected");
//     Serial.print("ESP32 DevKit IP: ");
//     Serial.println(WiFi.localIP());
//   } else {
//     Serial.println("WiFi failed. Dustbin will still work locally.");
//   }
// }

// // ===================== Small JSON Helpers =====================
// String jsonValue(String body, String key) {
//   String marker = "\"" + key + "\"";
//   int keyIndex = body.indexOf(marker);
//   if (keyIndex < 0) {
//     return "";
//   }

//   int colonIndex = body.indexOf(":", keyIndex);
//   if (colonIndex < 0) {
//     return "";
//   }

//   int firstQuote = body.indexOf("\"", colonIndex + 1);
//   if (firstQuote < 0) {
//     return "";
//   }

//   int secondQuote = body.indexOf("\"", firstQuote + 1);
//   if (secondQuote < 0) {
//     return "";
//   }

//   return body.substring(firstQuote + 1, secondQuote);
// }

// void sendCorsHeaders() {
//   server.sendHeader("Access-Control-Allow-Origin", "*");
//   server.sendHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
//   server.sendHeader("Access-Control-Allow-Headers", "Content-Type,x-device-token");
// }

// void handleOptions() {
//   sendCorsHeaders();
//   server.send(204, "text/plain", "");
// }

// void handleDevKitStatus() {
//   sendCorsHeaders();

//   String json = "{";
//   json += "\"device\":\"smart_dustbin_01\",";
//   json += "\"status\":\"online\",";
//   json += "\"ip\":\"";
//   json += WiFi.localIP().toString();
//   json += "\",";
//   json += "\"challengeArmed\":";
//   json += challengeArmed ? "true" : "false";
//   json += ",";
//   json += "\"mission_id\":\"";
//   json += activeMissionId;
//   json += "\",";
//   json += "\"expected_label\":\"";
//   json += activeExpectedLabel;
//   json += "\",";
//   json += "\"backend_url\":\"";
//   json += backendUrl;
//   json += "\",";
//   json += "\"esp32_cam_capture_url\":\"";
//   json += esp32CamCaptureUrl;
//   json += "\",";
//   json += "\"binFull\":";
//   json += binFull ? "true" : "false";
//   json += ",";
//   json += "\"wasteCount\":";
//   json += wasteCount;
//   json += "}";

//   server.send(200, "application/json", json);
// }

// void handleStartChallenge() {
//   sendCorsHeaders();

//   if (server.method() == HTTP_OPTIONS) {
//     server.send(204, "text/plain", "");
//     return;
//   }

//   String body = server.arg("plain");
//   activeMissionId = jsonValue(body, "mission_id");
//   activeChallengeId = jsonValue(body, "challenge_id");
//   activeExpectedLabel = jsonValue(body, "expected_label");
//   activeUserId = jsonValue(body, "user_id");

//   String requestedBackendUrl = jsonValue(body, "backend_url");
//   String requestedCameraUrl = jsonValue(body, "esp32_cam_capture_url");

//   if (activeUserId.length() == 0) {
//     activeUserId = "USR-0042";
//   }

//   if (requestedBackendUrl.length() > 0) {
//     backendUrl = requestedBackendUrl;
//   }

//   if (requestedCameraUrl.length() > 0) {
//     esp32CamCaptureUrl = requestedCameraUrl;
//   }

//   wasteCount = 0;
//   binFull = false;
//   obstacleLeftTime = 0;
//   lastWasteDetectTime = 0;
//   updateBinStatusLED();

//   challengeArmed = activeMissionId.length() > 0 && activeExpectedLabel.length() > 0;

//   if (!challengeArmed) {
//     server.send(400, "application/json", "{\"ok\":false,\"error\":\"mission_id and expected_label are required\"}");
//     return;
//   }

//   Serial.println("Challenge armed from web dashboard");
//   Serial.print("Mission: ");
//   Serial.println(activeMissionId);
//   Serial.print("Expected label: ");
//   Serial.println(activeExpectedLabel);
//   Serial.println("Mission armed. Ultrasonic sensor is now waiting before IR verification.");

//   long initialDistance = getDistanceCM();
//   Serial.print("Initial ultrasonic distance: ");
//   Serial.print(initialDistance);
//   Serial.println(" cm");

//   if (initialDistance > 0 && initialDistance <= PERSON_DISTANCE_CM) {
//     Serial.println("Person/Object already near dustbin. Opening lid through servo.");
//     openLid();
//     lidOpenedByUltrasonic = true;
//   } else {
//     closeLid();
//     lidOpenedByUltrasonic = false;
//   }

//   String response = "{";
//   response += "\"ok\":true,";
//   response += "\"status\":\"armed\",";
//   response += "\"mission_id\":\"";
//   response += activeMissionId;
//   response += "\",";
//   response += "\"expected_label\":\"";
//   response += activeExpectedLabel;
//   response += "\"";
//   response += "}";

//   server.send(200, "application/json", response);
// }

// void handleResetBin() {
//   sendCorsHeaders();

//   if (server.method() == HTTP_OPTIONS) {
//     server.send(204, "text/plain", "");
//     return;
//   }

//   wasteCount = 0;
//   binFull = false;
//   challengeArmed = false;
//   lidOpenedByUltrasonic = false;
//   activeMissionId = "";
//   activeChallengeId = "";
//   activeExpectedLabel = "";
//   obstacleLeftTime = 0;
//   lastWasteDetectTime = 0;
//   closeLid();
//   updateBinStatusLED();

//   server.send(200, "application/json", "{\"ok\":true,\"status\":\"reset\",\"wasteCount\":0,\"binFull\":false}");
// }

// void startDevKitServer() {
//   if (commandServerStarted) {
//     return;
//   }

//   server.on("/start-challenge", HTTP_OPTIONS, handleOptions);
//   server.on("/start-challenge", HTTP_POST, handleStartChallenge);
//   server.on("/reset-bin", HTTP_OPTIONS, handleOptions);
//   server.on("/reset-bin", HTTP_POST, handleResetBin);
//   server.on("/status", HTTP_GET, handleDevKitStatus);
//   server.begin();
//   commandServerStarted = true;

//   Serial.println("ESP32 DevKit command server started");
//   Serial.print("Start Challenge URL: http://");
//   Serial.print(WiFi.localIP());
//   Serial.println("/start-challenge");
// }

// // ===================== Ultrasonic Distance Function =====================
// long getDistanceCM() {
//   digitalWrite(TRIG_PIN, LOW);
//   delayMicroseconds(2);

//   digitalWrite(TRIG_PIN, HIGH);
//   delayMicroseconds(10);
//   digitalWrite(TRIG_PIN, LOW);

//   long duration = pulseIn(ECHO_PIN, HIGH, 30000);

//   if (duration == 0) {
//     return -1;
//   }

//   long distance = duration * 0.034 / 2;
//   return distance;
// }

// // ===================== LED Status Function =====================
// void updateBinStatusLED() {
//   if (binFull) {
//     digitalWrite(RED_LED_PIN, HIGH);
//     digitalWrite(GREEN_LED_PIN, LOW);
//   } else {
//     digitalWrite(RED_LED_PIN, LOW);
//     digitalWrite(GREEN_LED_PIN, HIGH);
//   }
// }

// // ===================== Buzzer Functions =====================
// void beepSuccess() {
//   digitalWrite(BUZZER_PIN, HIGH);
//   delay(200);
//   digitalWrite(BUZZER_PIN, LOW);
// }

// void beepFullWarning() {
//   for (int i = 0; i < 3; i++) {
//     digitalWrite(BUZZER_PIN, HIGH);
//     delay(150);
//     digitalWrite(BUZZER_PIN, LOW);
//     delay(150);
//   }
// }

// void beepTryAgain() {
//   for (int i = 0; i < 2; i++) {
//     digitalWrite(BUZZER_PIN, HIGH);
//     delay(80);
//     digitalWrite(BUZZER_PIN, LOW);
//     delay(120);
//   }
// }

// // ===================== Servo Functions =====================
// void openLid() {
//   if (!lidOpen) {
//     lidServo.write(LID_OPEN_ANGLE);
//     lidOpen = true;
//     Serial.println("Lid opened");
//   }
// }

// void closeLid() {
//   if (lidOpen) {
//     lidServo.write(LID_CLOSED_ANGLE);
//     lidOpen = false;
//     Serial.println("Lid closed");
//   }
// }

// // ===================== ESP32-CAM Capture Function =====================
// bool triggerCameraCapture() {
//   if (WiFi.status() != WL_CONNECTED) {
//     Serial.println("WiFi not connected. Camera not triggered.");
//     return false;
//   }

//   HTTPClient http;

//   Serial.print("Triggering ESP32-CAM: ");
//   Serial.println(esp32CamCaptureUrl);

//   http.begin(esp32CamCaptureUrl);

//   int responseCode = http.GET();

//   Serial.print("ESP32-CAM response: ");
//   Serial.println(responseCode);

//   http.end();

//   if (responseCode == 200) {
//     Serial.println("Camera capture successful");
//     return true;
//   }

//   Serial.println("Camera capture failed");
//   return false;
// }

// // ===================== Backend Log Function =====================
// bool sendWasteLogToBackend(bool cameraCaptured) {
//   lastBackendReached = false;

//   if (!USE_BACKEND) {
//     Serial.println("Backend disabled. Skipping backend request.");
//     lastBackendReached = true;
//     return true;
//   }

//   if (WiFi.status() != WL_CONNECTED) {
//     Serial.println("WiFi not connected. Cannot send to backend.");
//     return false;
//   }

//   HTTPClient http;

//   http.begin(backendUrl);
//   http.addHeader("Content-Type", "application/json");
//   if (deviceToken.length() > 0) {
//     http.addHeader("x-device-token", deviceToken);
//   }

//   String jsonData = "{";
//   jsonData += "\"device\":\"smart_dustbin_01\",";
//   jsonData += "\"event\":\"waste_detected\",";
//   jsonData += "\"bin_id\":\"BIN-001\",";
//   jsonData += "\"user_id\":\"";
//   jsonData += activeUserId;
//   jsonData += "\",";
//   jsonData += "\"mission_id\":\"";
//   jsonData += activeMissionId;
//   jsonData += "\",";
//   jsonData += "\"challenge_id\":\"";
//   jsonData += activeChallengeId;
//   jsonData += "\",";
//   jsonData += "\"expected_label\":\"";
//   jsonData += activeExpectedLabel;
//   jsonData += "\",";
//   jsonData += "\"esp32CamCaptureUrl\":\"";
//   jsonData += esp32CamCaptureUrl;
//   jsonData += "\",";
//   jsonData += "\"wasteCount\":";
//   jsonData += wasteCount;
//   jsonData += ",";
//   jsonData += "\"fullWasteLimit\":";
//   jsonData += FULL_WASTE_LIMIT;
//   jsonData += ",";
//   jsonData += "\"cameraCaptured\":";
//   jsonData += cameraCaptured ? "true" : "false";
//   jsonData += "}";

//   Serial.print("Sending backend data: ");
//   Serial.println(jsonData);

//   int responseCode = http.POST(jsonData);
//   String responseBody = http.getString();

//   Serial.print("Backend response: ");
//   Serial.println(responseCode);
//   Serial.println(responseBody);

//   http.end();

//   if (responseCode < 200 || responseCode >= 300) {
//     return false;
//   }

//   lastBackendReached = true;
//   return responseBody.indexOf("\"beep\":true") >= 0 || responseBody.indexOf("\"status\":\"correct\"") >= 0;
// }

// // ===================== Waste Detection Function =====================
// void handleWasteDetected() {
//   unsigned long currentTime = millis();

//   if (currentTime - lastWasteDetectTime < IR_DEBOUNCE_TIME) {
//     return;
//   }

//   lastWasteDetectTime = currentTime;

//   Serial.println("Waste detected by IR sensor");

//   if (!challengeArmed) {
//     Serial.println("No active web mission. Ignoring waste event.");
//     beepTryAgain();
//     return;
//   }

//   wasteCount++;

//   Serial.print("Current waste count: ");
//   Serial.println(wasteCount);

//   bool cameraCaptured = false;
//   bool approved = sendWasteLogToBackend(cameraCaptured);

//   if (wasteCount >= FULL_WASTE_LIMIT) {
//     binFull = true;
//     Serial.println("Bin is now FULL");
//     beepFullWarning();
//   } else {
//     if (approved) {
//       Serial.println("Backend approved the challenge. Correct item.");
//       beepSuccess();
//     } else if (lastBackendReached) {
//       Serial.println("Backend rejected the item. Try again from dashboard.");
//       beepTryAgain();
//     } else {
//       Serial.println("Waste counted locally, but backend failed.");
//       beepTryAgain();
//     }
//   }

//   if (lastBackendReached) {
//     challengeArmed = false;
//     activeMissionId = "";
//     activeChallengeId = "";
//     activeExpectedLabel = "";
//   }

//   updateBinStatusLED();
// }

// // ===================== Startup Component Test =====================
// void startupTest() {
//   Serial.println("Running startup component test...");

//   digitalWrite(GREEN_LED_PIN, HIGH);
//   digitalWrite(RED_LED_PIN, LOW);
//   delay(500);

//   digitalWrite(GREEN_LED_PIN, LOW);
//   digitalWrite(RED_LED_PIN, HIGH);
//   delay(500);

//   digitalWrite(GREEN_LED_PIN, LOW);
//   digitalWrite(RED_LED_PIN, LOW);

//   beepSuccess();

//   Serial.println("Testing servo...");
//   openLid();
//   delay(1000);
//   closeLid();
//   delay(1000);

//   updateBinStatusLED();

//   Serial.println("Startup test complete");
// }

// // ===================== Setup =====================
// void setup() {
//   Serial.begin(115200);

//   pinMode(TRIG_PIN, OUTPUT);
//   pinMode(ECHO_PIN, INPUT);

//   pinMode(IR_PIN, INPUT);

//   pinMode(GREEN_LED_PIN, OUTPUT);
//   pinMode(RED_LED_PIN, OUTPUT);

//   pinMode(BUZZER_PIN, OUTPUT);
//   digitalWrite(BUZZER_PIN, LOW);

//   lidServo.attach(SERVO_PIN);
//   closeLid();

//   updateBinStatusLED();

//   Serial.println();
//   Serial.println("Smart Dustbin Full System Started");

//   startupTest();
//   connectWiFi();
//   if (WiFi.status() == WL_CONNECTED) {
//     startDevKitServer();
//   }
// }

// // ===================== Main Loop =====================
// void loop() {
//   server.handleClient();
//   updateBinStatusLED();

//   if (WiFi.status() != WL_CONNECTED) {
//     Serial.println("WiFi disconnected. Trying reconnect...");
//     connectWiFi();
//     if (WiFi.status() == WL_CONNECTED) {
//       startDevKitServer();
//     }
//   }

//   if (binFull) {
//     Serial.println("Bin is full. Lid will not open.");
//     closeLid();
//     delay(1000);
//     return;
//   }

//   long distance = getDistanceCM();

//   Serial.print("Distance: ");
//   Serial.print(distance);
//   Serial.println(" cm");

//   bool obstaclePresent = distance > 0 && distance <= PERSON_DISTANCE_CM;

//   if (obstaclePresent) {
//     Serial.println("Person/Object detected near dustbin");
//     openLid();
//     lidOpenedByUltrasonic = true;

//     obstacleLeftTime = 0;
//   } else {
//     if (lidOpen) {
//       if (obstacleLeftTime == 0) {
//         obstacleLeftTime = millis();
//         Serial.println("Obstacle left. Starting 5 second close timer.");
//       }

//       if (millis() - obstacleLeftTime >= CLOSE_DELAY_AFTER_LEAVE) {
//         closeLid();
//         lidOpenedByUltrasonic = false;
//         obstacleLeftTime = 0;
//       }
//     }
//   }

//   if (!challengeArmed) {
//     delay(300);
//     return;
//   }

//   if (lidOpen && lidOpenedByUltrasonic) {
//     int irValue = digitalRead(IR_PIN);

//     Serial.print("IR value: ");
//     Serial.println(irValue);

//     if (irValue == IR_OBJECT_DETECTED) {
//       handleWasteDetected();
//     }
//   }

//   delay(300);
// }
