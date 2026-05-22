// #include "esp_camera.h"
// #include <WiFi.h>
// #include "esp_http_server.h"

// // ===================== WiFi Settings =====================
// const char* ssid = "YOUR_WIFI_NAME";
// const char* password = "YOUR_WIFI_PASSWORD";

// // ===================== ESP32-CAM AI Thinker Pins =====================
// #define PWDN_GPIO_NUM     32
// #define RESET_GPIO_NUM    -1
// #define XCLK_GPIO_NUM      0
// #define SIOD_GPIO_NUM     26
// #define SIOC_GPIO_NUM     27

// #define Y9_GPIO_NUM       35
// #define Y8_GPIO_NUM       34
// #define Y7_GPIO_NUM       39
// #define Y6_GPIO_NUM       36
// #define Y5_GPIO_NUM       21
// #define Y4_GPIO_NUM       19
// #define Y3_GPIO_NUM       18
// #define Y2_GPIO_NUM        5

// #define VSYNC_GPIO_NUM    25
// #define HREF_GPIO_NUM     23
// #define PCLK_GPIO_NUM     22

// // Built-in flash LED on most AI Thinker ESP32-CAM boards
// #define FLASH_LED_PIN      4

// httpd_handle_t camera_httpd = NULL;

// // ===================== Flash Control =====================
// void flashOn() {
//   digitalWrite(FLASH_LED_PIN, HIGH);
// }

// void flashOff() {
//   digitalWrite(FLASH_LED_PIN, LOW);
// }

// // ===================== Single Image Capture =====================
// static esp_err_t capture_handler(httpd_req_t *req) {
//   Serial.println("Capture request received");

//   flashOn();
//   delay(150);

//   camera_fb_t *fb = esp_camera_fb_get();

//   flashOff();

//   if (!fb) {
//     Serial.println("Camera capture failed");
//     httpd_resp_send_500(req);
//     return ESP_FAIL;
//   }

//   httpd_resp_set_type(req, "image/jpeg");
//   httpd_resp_set_hdr(req, "Content-Disposition", "inline; filename=waste_capture.jpg");
//   httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

//   esp_err_t res = httpd_resp_send(req, (const char *)fb->buf, fb->len);

//   Serial.print("Image captured. Size: ");
//   Serial.print(fb->len);
//   Serial.println(" bytes");

//   esp_camera_fb_return(fb);

//   return res;
// }

// // ===================== Live Stream =====================
// static esp_err_t stream_handler(httpd_req_t *req) {
//   camera_fb_t *fb = NULL;
//   esp_err_t res = ESP_OK;

//   res = httpd_resp_set_type(req, "multipart/x-mixed-replace; boundary=frame");
//   httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

//   if (res != ESP_OK) {
//     return res;
//   }

//   Serial.println("Stream started");

//   while (true) {
//     fb = esp_camera_fb_get();

//     if (!fb) {
//       Serial.println("Camera capture failed during stream");
//       return ESP_FAIL;
//     }

//     char header[80];
//     size_t header_len = snprintf(
//       header,
//       sizeof(header),
//       "--frame\r\nContent-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n",
//       fb->len
//     );

//     res = httpd_resp_send_chunk(req, header, header_len);

//     if (res == ESP_OK) {
//       res = httpd_resp_send_chunk(req, (const char *)fb->buf, fb->len);
//     }

//     if (res == ESP_OK) {
//       res = httpd_resp_send_chunk(req, "\r\n", 2);
//     }

//     esp_camera_fb_return(fb);

//     if (res != ESP_OK) {
//       Serial.println("Stream stopped");
//       break;
//     }

//     delay(80);
//   }

//   return res;
// }

// // ===================== Camera Status Endpoint =====================
// static esp_err_t status_handler(httpd_req_t *req) {
//   String message = "{";
//   message += "\"device\":\"esp32_cam_dustbin\",";
//   message += "\"status\":\"online\",";
//   message += "\"ip\":\"";
//   message += WiFi.localIP().toString();
//   message += "\",";
//   message += "\"capture\":\"/capture\",";
//   message += "\"stream\":\"/stream\"";
//   message += "}";

//   httpd_resp_set_type(req, "application/json");
//   httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

//   return httpd_resp_send(req, message.c_str(), message.length());
// }

// // ===================== Flash Test Endpoint =====================
// static esp_err_t flash_handler(httpd_req_t *req) {
//   flashOn();
//   delay(500);
//   flashOff();

//   String message = "Flash tested successfully";

//   httpd_resp_set_type(req, "text/plain");
//   httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

//   return httpd_resp_send(req, message.c_str(), message.length());
// }

// // ===================== Start Camera Server =====================
// void startCameraServer() {
//   httpd_config_t config = HTTPD_DEFAULT_CONFIG();
//   config.server_port = 80;

//   httpd_uri_t capture_uri = {
//     .uri       = "/capture",
//     .method    = HTTP_GET,
//     .handler   = capture_handler,
//     .user_ctx  = NULL
//   };

//   httpd_uri_t stream_uri = {
//     .uri       = "/stream",
//     .method    = HTTP_GET,
//     .handler   = stream_handler,
//     .user_ctx  = NULL
//   };

//   httpd_uri_t status_uri = {
//     .uri       = "/status",
//     .method    = HTTP_GET,
//     .handler   = status_handler,
//     .user_ctx  = NULL
//   };

//   httpd_uri_t flash_uri = {
//     .uri       = "/flash",
//     .method    = HTTP_GET,
//     .handler   = flash_handler,
//     .user_ctx  = NULL
//   };

//   if (httpd_start(&camera_httpd, &config) == ESP_OK) {
//     httpd_register_uri_handler(camera_httpd, &capture_uri);
//     httpd_register_uri_handler(camera_httpd, &stream_uri);
//     httpd_register_uri_handler(camera_httpd, &status_uri);
//     httpd_register_uri_handler(camera_httpd, &flash_uri);

//     Serial.println("Camera server started");
//   } else {
//     Serial.println("Failed to start camera server");
//   }
// }

// // ===================== WiFi Connect =====================
// void connectWiFi() {
//   WiFi.mode(WIFI_STA);
//   WiFi.begin(ssid, password);

//   Serial.print("Connecting to WiFi");

//   int attempts = 0;

//   while (WiFi.status() != WL_CONNECTED && attempts < 40) {
//     delay(500);
//     Serial.print(".");
//     attempts++;
//   }

//   Serial.println();

//   if (WiFi.status() == WL_CONNECTED) {
//     Serial.println("WiFi connected");
//     Serial.print("ESP32-CAM IP Address: ");
//     Serial.println(WiFi.localIP());

//     Serial.print("Live Stream: http://");
//     Serial.print(WiFi.localIP());
//     Serial.println("/stream");

//     Serial.print("Capture Image: http://");
//     Serial.print(WiFi.localIP());
//     Serial.println("/capture");

//     Serial.print("Status: http://");
//     Serial.print(WiFi.localIP());
//     Serial.println("/status");

//     Serial.print("Flash Test: http://");
//     Serial.print(WiFi.localIP());
//     Serial.println("/flash");
//   } else {
//     Serial.println("WiFi connection failed. Restarting...");
//     delay(3000);
//     ESP.restart();
//   }
// }

// // ===================== Camera Setup =====================
// void setupCamera() {
//   camera_config_t config;

//   config.ledc_channel = LEDC_CHANNEL_0;
//   config.ledc_timer = LEDC_TIMER_0;

//   config.pin_d0 = Y2_GPIO_NUM;
//   config.pin_d1 = Y3_GPIO_NUM;
//   config.pin_d2 = Y4_GPIO_NUM;
//   config.pin_d3 = Y5_GPIO_NUM;
//   config.pin_d4 = Y6_GPIO_NUM;
//   config.pin_d5 = Y7_GPIO_NUM;
//   config.pin_d6 = Y8_GPIO_NUM;
//   config.pin_d7 = Y9_GPIO_NUM;

//   config.pin_xclk = XCLK_GPIO_NUM;
//   config.pin_pclk = PCLK_GPIO_NUM;
//   config.pin_vsync = VSYNC_GPIO_NUM;
//   config.pin_href = HREF_GPIO_NUM;

//   config.pin_sccb_sda = SIOD_GPIO_NUM;
//   config.pin_sccb_scl = SIOC_GPIO_NUM;

//   config.pin_pwdn = PWDN_GPIO_NUM;
//   config.pin_reset = RESET_GPIO_NUM;

//   config.xclk_freq_hz = 20000000;
//   config.pixel_format = PIXFORMAT_JPEG;

//   if (psramFound()) {
//     config.frame_size = FRAMESIZE_VGA;
//     config.jpeg_quality = 10;
//     config.fb_count = 2;
//     Serial.println("PSRAM found. Using VGA quality.");
//   } else {
//     config.frame_size = FRAMESIZE_QVGA;
//     config.jpeg_quality = 12;
//     config.fb_count = 1;
//     Serial.println("No PSRAM found. Using QVGA quality.");
//   }

//   esp_err_t err = esp_camera_init(&config);

//   if (err != ESP_OK) {
//     Serial.printf("Camera init failed with error 0x%x\n", err);
//     delay(3000);
//     ESP.restart();
//   }

//   sensor_t *s = esp_camera_sensor_get();

//   // Useful image settings for dustbin/waste capture
//   s->set_brightness(s, 0);     // -2 to 2
//   s->set_contrast(s, 1);       // -2 to 2
//   s->set_saturation(s, 0);     // -2 to 2
//   s->set_sharpness(s, 1);      // -2 to 2
//   s->set_denoise(s, 1);
//   s->set_whitebal(s, 1);
//   s->set_awb_gain(s, 1);
//   s->set_exposure_ctrl(s, 1);
//   s->set_gain_ctrl(s, 1);

//   Serial.println("Camera initialized successfully");
// }

// // ===================== Setup =====================
// void setup() {
//   Serial.begin(115200);
//   Serial.println();

//   pinMode(FLASH_LED_PIN, OUTPUT);
//   flashOff();

//   Serial.println("ESP32-CAM Smart Dustbin Camera Started");

//   setupCamera();
//   connectWiFi();
//   startCameraServer();
// }

// // ===================== Loop =====================
// void loop() {
//   if (WiFi.status() != WL_CONNECTED) {
//     Serial.println("WiFi disconnected. Reconnecting...");
//     connectWiFi();
//   }

//   delay(5000);
// }
