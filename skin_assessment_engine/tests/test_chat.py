"""
Tests for Clinical Chat & Lumina AI Skincare Assistant Router
Verifies multi-role conversations, Lumina AI contextual responses, message retrieval, and sending.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_user_chat_conversations():
    """Verify user/patient gets Lumina AI, Consultant, and Doctor."""
    response = client.get("/chat/conversations?user_id=1&role=user")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["conversations"]) >= 3
    contact_ids = [c["contact_id"] for c in data["conversations"]]
    assert "lumina_ai" in contact_ids
    assert "2" in contact_ids  # Elena Vance
    assert "3" in contact_ids  # Dr. Julian Rostova


def test_get_consultant_chat_conversations():
    """Verify consultant gets Lumina AI, assigned clients, and supervising doctor."""
    response = client.get("/chat/conversations?user_id=2&role=consultant")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    contact_ids = [c["contact_id"] for c in data["conversations"]]
    assert "lumina_ai" in contact_ids
    assert "1" in contact_ids  # Alex Rivera
    assert "3" in contact_ids  # Dr. Julian Rostova


def test_get_chat_messages():
    """Verify message retrieval for Lumina AI thread."""
    response = client.get("/chat/messages?contact_id=lumina_ai&user_id=1")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["count"] >= 1
    assert len(data["messages"]) >= 1


def test_send_message_to_lumina_ai():
    """Verify sending message to Lumina AI generates intelligent clinical response."""
    payload = {
        "sender_id": "1",
        "sender_name": "Alex Rivera",
        "sender_role": "user",
        "recipient_id": "lumina_ai",
        "recipient_name": "Lumina AI",
        "recipient_role": "ai_assistant",
        "message": "How do I repair my compromised skin barrier and soothe redness?"
    }
    response = client.post("/chat/send", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["sent_message"]["message"] == payload["message"]
    assert data["ai_reply"] is not None
    assert "Ceramides" in data["ai_reply"]["message"] or "Barrier" in data["ai_reply"]["message"] or "Lipid" in data["ai_reply"]["message"]


def test_send_message_to_doctor():
    """Verify sending direct message to Doctor."""
    payload = {
        "sender_id": "1",
        "sender_name": "Alex Rivera",
        "sender_role": "user",
        "recipient_id": "3",
        "recipient_name": "Dr. Julian Rostova, MD",
        "recipient_role": "dermatologist",
        "message": "Dr. Rostova, my skin feels great with the new adapalene schedule."
    }
    response = client.post("/chat/send", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["sent_message"]["message"] == payload["message"]
    assert data["ai_reply"] is None


def test_mark_chat_read():
    """Verify marking messages as read."""
    payload = {
        "user_id": "1",
        "contact_id": "2"
    }
    response = client.post("/chat/mark-read", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
