// /*
//   EcoQuest Smart Dustbin - ESP32 DevKit Firmware

//   Matches the shown wiring:
//   - IR sensor OUT      -> GPIO 27
//   - Servo signal       -> GPIO 18
//   - Ultrasonic 1 TRIG  -> GPIO 25
//   - Ultrasonic 1 ECHO  -> GPIO 34 through voltage divider
//   - Ultrasonic 2 TRIG  -> GPIO 26
//   - Ultrasonic 2 ECHO  -> GPIO 35 through voltage divider
//   - Red LED anode      -> GPIO 32 through 220 ohm resistor
//   - Green LED anode    -> GPIO 33 through 220 ohm resistor

//   Backend flow:
//   1. Dashboard starts a mission.
//   2. DevKit polls GET /api/session and receives ENABLE.
//   3. IR sensor detects waste.
//   4. DevKit POSTs /api/wasteDetected.
//   5. DevKit GETs /api/capture; the backend fetches ESP32-CAM and runs AI/fallback.
//   6. DevKit GETs /api/classification and receives SECTION1, SECTION2, or UNKNOWN.
//   7. DevKit moves servo, updates LEDs, and POSTs /api/dashboard + /api/binlevels.
// */

// #include <WiFi.h>
// #include <HTTPClient.h>
// #include <WebServer.h>
// #include <ESP32Servo.h>

// // ===================== WiFi =====================
// const char* WIFI_SSID = "PGyaltshay!";
// const char* WIFI_PASSWORD = "gyaltshay";

// // IMPORTANT: this is the laptop / Next.js backend, not the DevKit IP.
// String serverURL = "http://172.20.10.4:3000";

// // ===================== EcoQuest identity =====================
// const char* USER_ID = "USR-0042";
// const char* BIN_ID = "BIN-001";

// // ===================== Pins from your connection table =====================
// #define IR_SENSOR_PIN 27
// #define SERVO_PIN 18

// #define TRIG_BIN1_PIN 25
// #define ECHO_BIN1_PIN 34

// #define TRIG_BIN2_PIN 26
// #define ECHO_BIN2_PIN 35

// #define RED_LED_PIN 32
// #define GREEN_LED_PIN 33

// // ===================== Settings =====================
// const bool IR_ACTIVE_LOW = true;
// const int FULL_DISTANCE_CM = 8;
// const int ECHO_TIMEOUT_US = 30000;

// const int SERVO_CENTER_ANGLE = 90;
// const int SERVO_SECTION1_ANGLE = 35;   // plastic / bottle / dry side
// const int SERVO_SECTION2_ANGLE = 145;  // paper / can / wet side

// const int LOCAL_POINTS_PER_SUCCESS = 5;
// const unsigned long SESSION_POLL_MS = 3000;
// const unsigned long BIN_UPDATE_MS = 5000;
// const unsigned long IR_DEBOUNCE_MS = 1200;

// // ===================== Runtime state =====================
// Servo sorterServo;
// WebServer debugServer(80);

// bool sessionActive = false;
// bool processingWaste = false;
// bool lastWasteDetected = false;

// int localPoints = 0;
// int lastBin1Distance = -1;
// int lastBin2Distance = -1;

// unsigned long lastSessionPollAt = 0;
// unsigned long lastBinUpdateAt = 0;
// unsigned long lastWasteHandledAt = 0;

// // ===================== Setup =====================
// void setup() {
//   Serial.begin(115200);
//   delay(300);

//   pinMode(IR_SENSOR_PIN, INPUT);

//   pinMode(TRIG_BIN1_PIN, OUTPUT);
//   pinMode(ECHO_BIN1_PIN, INPUT);
//   pinMode(TRIG_BIN2_PIN, OUTPUT);
//   pinMode(ECHO_BIN2_PIN, INPUT);

//   pinMode(RED_LED_PIN, OUTPUT);
//   pinMode(GREEN_LED_PIN, OUTPUT);
//   setIdleLeds();

//   sorterServo.attach(SERVO_PIN, 500, 2400);
//   moveServoCenter();

//   Serial.println();
//   Serial.println("====================================");
//   Serial.println("EcoQuest Smart Dustbin DevKit");
//   Serial.println("Polling backend mode");
//   Serial.println("====================================");

//   connectWiFi();
//   startDebugServer();
//   testOutputs();

//   Serial.println("SYSTEM READY");
//   Serial.println("Waiting for dashboard mission...");
// }

// // ===================== Main loop =====================
// void loop() {
//   debugServer.handleClient();
//   ensureWiFi();

//   unsigned long now = millis();

//   if (now - lastSessionPollAt >= SESSION_POLL_MS) {
//     pollSession();
//     lastSessionPollAt = now;
//   }

//   lastBin1Distance = readUltrasonicCm(TRIG_BIN1_PIN, ECHO_BIN1_PIN);
//   lastBin2Distance = readUltrasonicCm(TRIG_BIN2_PIN, ECHO_BIN2_PIN);

//   bool binFull = isBinFull(lastBin1Distance) || isBinFull(lastBin2Distance);
//   updateStatusLeds(binFull);

//   if (now - lastBinUpdateAt >= BIN_UPDATE_MS) {
//     postBinLevels(lastBin1Distance, lastBin2Distance);
//     lastBinUpdateAt = now;
//   }

//   bool wasteDetected = readIRSensor();

//   if (!sessionActive || processingWaste || binFull) {
//     lastWasteDetected = wasteDetected;
//     delay(100);
//     return;
//   }

//   if (wasteDetected && !lastWasteDetected && now - lastWasteHandledAt >= IR_DEBOUNCE_MS) {
//     lastWasteHandledAt = now;
//     handleWasteDetected(lastBin1Distance, lastBin2Distance);
//   }

//   lastWasteDetected = wasteDetected;
//   delay(100);
// }

// // ===================== WiFi =====================
// void connectWiFi() {
//   WiFi.mode(WIFI_STA);
//   WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

//   Serial.print("Connecting to WiFi");

//   int attempts = 0;
//   while (WiFi.status() != WL_CONNECTED && attempts < 60) {
//     delay(500);
//     Serial.print(".");
//     attempts++;
//   }

//   Serial.println();

//   if (WiFi.status() != WL_CONNECTED) {
//     Serial.println("WiFi connection failed. Restarting...");
//     delay(2000);
//     ESP.restart();
//   }

//   Serial.println("WiFi connected");
//   Serial.print("DevKit IP: ");
//   Serial.println(WiFi.localIP());
//   Serial.print("Backend serverURL: ");
//   Serial.println(serverURL);
// }

// void ensureWiFi() {
//   if (WiFi.status() == WL_CONNECTED) {
//     return;
//   }

//   Serial.println("WiFi disconnected. Reconnecting...");
//   setErrorLeds();
//   connectWiFi();
// }

// // ===================== Debug HTTP server =====================
// void startDebugServer() {
//   debugServer.on("/health", HTTP_GET, handleHealth);
//   debugServer.on("/status", HTTP_GET, handleHealth);
//   debugServer.begin();

//   Serial.println("Debug HTTP server started on port 80");
//   Serial.print("Health: http://");
//   Serial.print(WiFi.localIP());
//   Serial.println("/health");
// }

// void handleHealth() {
//   String json = "{";
//   json += "\"ok\":true,";
//   json += "\"device\":\"ecoquest_devkit\",";
//   json += "\"mode\":\"polling\",";
//   json += "\"ip\":\"" + WiFi.localIP().toString() + "\",";
//   json += "\"backend\":\"" + serverURL + "\",";
//   json += "\"sessionActive\":";
//   json += sessionActive ? "true" : "false";
//   json += ",";
//   json += "\"processingWaste\":";
//   json += processingWaste ? "true" : "false";
//   json += ",";
//   json += "\"bin1_cm\":";
//   json += String(lastBin1Distance);
//   json += ",";
//   json += "\"bin2_cm\":";
//   json += String(lastBin2Distance);
//   json += ",";
//   json += "\"localPoints\":";
//   json += String(localPoints);
//   json += "}";

//   debugServer.send(200, "application/json", json);
// }

// // ===================== Backend communication =====================
// String makeUrl(String path) {
//   String base = serverURL;
//   base.trim();

//   while (base.endsWith("/")) {
//     base.remove(base.length() - 1);
//   }

//   if (!path.startsWith("/")) {
//     path = "/" + path;
//   }

//   return base + path;
// }

// bool httpGetText(String path, String& payload, int timeoutMs = 8000) {
//   if (WiFi.status() != WL_CONNECTED) {
//     return false;
//   }

//   HTTPClient http;
//   String url = makeUrl(path);
//   http.begin(url);
//   http.setTimeout(timeoutMs);

//   int code = http.GET();
//   payload = code > 0 ? http.getString() : "";
//   http.end();

//   Serial.print("GET ");
//   Serial.print(path);
//   Serial.print(" -> ");
//   Serial.println(code);

//   return code >= 200 && code < 300;
// }

// bool httpPostJson(String path, String json, String& response, int timeoutMs = 10000) {
//   if (WiFi.status() != WL_CONNECTED) {
//     return false;
//   }

//   HTTPClient http;
//   String url = makeUrl(path);
//   http.begin(url);
//   http.addHeader("Content-Type", "application/json");
//   http.setTimeout(timeoutMs);

//   int code = http.POST(json);
//   response = code > 0 ? http.getString() : "";
//   http.end();

//   Serial.print("POST ");
//   Serial.print(path);
//   Serial.print(" -> ");
//   Serial.println(code);

//   if (response.length() > 0) {
//     Serial.println(response);
//   }

//   return code >= 200 && code < 300;
// }

// void pollSession() {
//   String payload;
//   if (!httpGetText("/api/session", payload, 5000)) {
//     Serial.println("Could not poll /api/session");
//     return;
//   }

//   payload.trim();
//   bool nextSessionActive = payload == "ENABLE";

//   if (nextSessionActive != sessionActive) {
//     sessionActive = nextSessionActive;

//     Serial.print("Session state: ");
//     Serial.println(sessionActive ? "ENABLE" : "DISABLE");

//     if (!sessionActive) {
//       processingWaste = false;
//       moveServoCenter();
//     }
//   }
// }

// void postBinLevels(int bin1Cm, int bin2Cm) {
//   String json = "{";
//   json += "\"bin_id\":\"" + String(BIN_ID) + "\",";
//   json += "\"bin1\":" + String(bin1Cm) + ",";
//   json += "\"bin2\":" + String(bin2Cm);
//   json += "}";

//   String response;
//   httpPostJson("/api/binlevels", json, response, 8000);
// }

// bool sendWasteDetected() {
//   String json = "{";
//   json += "\"status\":\"detected\",";
//   json += "\"user_id\":\"" + String(USER_ID) + "\",";
//   json += "\"bin_id\":\"" + String(BIN_ID) + "\"";
//   json += "}";

//   String response;
//   return httpPostJson("/api/wasteDetected", json, response, 10000);
// }

// bool triggerBackendCapture() {
//   String payload;
//   return httpGetText("/api/capture", payload, 35000);
// }

// String getClassification() {
//   unsigned long startedAt = millis();

//   while (millis() - startedAt < 15000) {
//     String payload;

//     if (httpGetText("/api/classification", payload, 8000)) {
//       payload.trim();
//       payload.toUpperCase();

//       Serial.print("Classification: ");
//       Serial.println(payload);

//       if (payload == "SECTION1" || payload == "SECTION2" || payload == "UNKNOWN") {
//         return payload;
//       }
//     }

//     delay(1000);
//   }

//   return "UNKNOWN";
// }

// void postDashboardUpdate(String classification, int bin1Cm, int bin2Cm) {
//   String json = "{";
//   json += "\"wasteType\":\"" + classification + "\",";
//   json += "\"bin_id\":\"" + String(BIN_ID) + "\",";
//   json += "\"user_id\":\"" + String(USER_ID) + "\",";
//   json += "\"bin1\":" + String(bin1Cm) + ",";
//   json += "\"bin2\":" + String(bin2Cm) + ",";
//   json += "\"points\":" + String(localPoints);
//   json += "}";

//   String response;
//   httpPostJson("/api/dashboard", json, response, 10000);
// }

// // ===================== Waste flow =====================
// void handleWasteDetected(int bin1Cm, int bin2Cm) {
//   processingWaste = true;
//   setProcessingLeds();

//   Serial.println("Waste detected by IR sensor");

//   bool signalSent = sendWasteDetected();
//   if (!signalSent) {
//     Serial.println("Failed to notify backend about waste detection");
//     handleUnknown(bin1Cm, bin2Cm);
//     processingWaste = false;
//     return;
//   }

//   bool captureOk = triggerBackendCapture();
//   if (!captureOk) {
//     Serial.println("Backend capture failed");
//     handleUnknown(bin1Cm, bin2Cm);
//     processingWaste = false;
//     return;
//   }

//   String classification = getClassification();

//   if (classification == "SECTION1") {
//     handleSection1(bin1Cm, bin2Cm);
//   } else if (classification == "SECTION2") {
//     handleSection2(bin1Cm, bin2Cm);
//   } else {
//     handleUnknown(bin1Cm, bin2Cm);
//   }

//   postDashboardUpdate(classification, bin1Cm, bin2Cm);
//   postBinLevels(bin1Cm, bin2Cm);

//   moveServoCenter();
//   processingWaste = false;
// }

// void handleSection1(int bin1Cm, int bin2Cm) {
//   Serial.println("Sorting to SECTION1");
//   localPoints += LOCAL_POINTS_PER_SUCCESS;

//   digitalWrite(GREEN_LED_PIN, HIGH);
//   digitalWrite(RED_LED_PIN, LOW);

//   moveServoToSection1();
//   delay(2500);
//   moveServoCenter();
//   delay(800);
// }

// void handleSection2(int bin1Cm, int bin2Cm) {
//   Serial.println("Sorting to SECTION2");
//   localPoints += LOCAL_POINTS_PER_SUCCESS;

//   digitalWrite(GREEN_LED_PIN, HIGH);
//   digitalWrite(RED_LED_PIN, LOW);

//   moveServoToSection2();
//   delay(2500);
//   moveServoCenter();
//   delay(800);
// }

// void handleUnknown(int bin1Cm, int bin2Cm) {
//   Serial.println("Classification UNKNOWN - rejecting");

//   moveServoCenter();
//   for (int i = 0; i < 3; i++) {
//     digitalWrite(RED_LED_PIN, HIGH);
//     digitalWrite(GREEN_LED_PIN, LOW);
//     delay(180);
//     digitalWrite(RED_LED_PIN, LOW);
//     delay(180);
//   }
// }

// // ===================== Sensors =====================
// bool readIRSensor() {
//   int value = digitalRead(IR_SENSOR_PIN);
//   return IR_ACTIVE_LOW ? value == LOW : value == HIGH;
// }

// int readUltrasonicCm(int trigPin, int echoPin) {
//   digitalWrite(trigPin, LOW);
//   delayMicroseconds(2);
//   digitalWrite(trigPin, HIGH);
//   delayMicroseconds(10);
//   digitalWrite(trigPin, LOW);

//   long duration = pulseIn(echoPin, HIGH, ECHO_TIMEOUT_US);
//   if (duration == 0) {
//     return -1;
//   }

//   return int((duration * 0.0343) / 2.0);
// }

// bool isBinFull(int distanceCm) {
//   return distanceCm > 0 && distanceCm <= FULL_DISTANCE_CM;
// }

// // ===================== Outputs =====================
// void moveServoToSection1() {
//   sorterServo.write(SERVO_SECTION1_ANGLE);
// }

// void moveServoToSection2() {
//   sorterServo.write(SERVO_SECTION2_ANGLE);
// }

// void moveServoCenter() {
//   sorterServo.write(SERVO_CENTER_ANGLE);
// }

// void setIdleLeds() {
//   digitalWrite(RED_LED_PIN, LOW);
//   digitalWrite(GREEN_LED_PIN, LOW);
// }

// void setErrorLeds() {
//   digitalWrite(RED_LED_PIN, HIGH);
//   digitalWrite(GREEN_LED_PIN, LOW);
// }

// void setProcessingLeds() {
//   digitalWrite(RED_LED_PIN, LOW);
//   digitalWrite(GREEN_LED_PIN, HIGH);
// }

// void updateStatusLeds(bool binFull) {
//   if (processingWaste) {
//     return;
//   }

//   if (binFull) {
//     digitalWrite(RED_LED_PIN, HIGH);
//     digitalWrite(GREEN_LED_PIN, LOW);
//     return;
//   }

//   if (sessionActive) {
//     digitalWrite(RED_LED_PIN, LOW);
//     digitalWrite(GREEN_LED_PIN, HIGH);
//     return;
//   }

//   setIdleLeds();
// }

// void testOutputs() {
//   Serial.println("Testing LEDs and servo");

//   digitalWrite(RED_LED_PIN, HIGH);
//   delay(300);
//   digitalWrite(RED_LED_PIN, LOW);

//   digitalWrite(GREEN_LED_PIN, HIGH);
//   delay(300);
//   digitalWrite(GREEN_LED_PIN, LOW);

//   moveServoCenter();
//   delay(400);
//   moveServoToSection1();
//   delay(500);
//   moveServoToSection2();
//   delay(500);
//   moveServoCenter();
//   delay(400);
// }
