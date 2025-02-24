import cv2
import requests
from flask import Flask, Response, request, jsonify
from ultralytics import YOLO

app = Flask(__name__)

# Load YOLO model
model = YOLO("Vandalism YOLO.pt")  # Load a pretrained YOLOv8 model

# Pushbullet API Token
ACCESS_TOKEN = "o.xRd8oufOSdGcePuxYYyJZ4NsnedAFzQI"
PUSHBULLET_URL = "https://api.pushbullet.com/v2/pushes"

# Function to send Pushbullet notification
def send_push_notification(message):
    data = {
        "type": "note",
        "title": "🔔 YOLO Detection Alert",
        "body": message
    }
    headers = {
        "Access-Token": ACCESS_TOKEN,
        "Content-Type": "application/json"
    }
    response = requests.post(PUSHBULLET_URL, json=data, headers=headers)
    if response.status_code == 200:
        print("✅ Notification sent successfully.")
    else:
        print(f"❌ Failed to send notification: {response.status_code}, {response.text}")

def generate_frames(video_path):
    cap = cv2.VideoCapture(video_path)
    
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break

        # Run YOLO inference
        results = model(frame)

        # Create an empty annotated frame
        annotated_frame = frame.copy()

        # Check if there are any detections
        if results[0].boxes is not None and len(results[0].boxes) > 0:
            for box in results[0].boxes:
                conf = box.conf.item()  # Confidence score
                if conf >= 0.2:  # ✅ Only draw if confidence is >= 0.8
                    x1, y1, x2, y2 = map(int, box.xyxy[0])  # Get box coordinates
                    label = f"{results[0].names[int(box.cls[0])]}: {conf:.2f}"  # Label with class name & confidence

                    # Draw bounding box
                    cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 255, 255), 2)
                    cv2.putText(annotated_frame, label, (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

                # 🔔 Send Pushbullet notification if confidence > 0.3
                if conf > 0.3:
                    send_push_notification(f"⚠️ ALERT: {results[0].names[int(box.cls[0])]} detected with confidence {conf:.2f}!")

        # Convert frame to JPEG format
        _, buffer = cv2.imencode('.jpg', annotated_frame)
        frame_bytes = buffer.tobytes()

        # Yield frame as part of a multipart response
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()

@app.route('/')
def home():
    return jsonify({"message": "YOLO Flask Server is Running!"})

@app.route('/process-video', methods=['POST'])
def process_video():
    if 'video' not in request.files:
        return {"success": False, "message": "No video uploaded."}, 400

    video = request.files['video']
    
    if video.filename == '':
        return {"success": False, "message": "No selected file."}, 400

    # Save the video temporarily
    video_path = "temp_video.mp4"
    video.save(video_path)

    return jsonify({"success": True, "video_stream_url": "http://localhost:5001/video-stream"})

@app.route('/video-stream')
def video_stream():
    return Response(generate_frames("temp_video.mp4"), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
