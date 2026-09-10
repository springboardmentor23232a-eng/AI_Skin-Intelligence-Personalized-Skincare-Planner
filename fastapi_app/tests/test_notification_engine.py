import unittest
from app.engine.notification_engine import NotificationEngine, DEFAULT_PREFERENCES
from app.schemas.notification import ReminderPreferences

class TestNotificationEngine(unittest.TestCase):

    def test_get_user_notifications_default(self):
        notifs = NotificationEngine.get_user_notifications(DEFAULT_PREFERENCES)
        self.assertGreater(len(notifs), 0)
        self.assertTrue(any(n.type == "ROUTINE" for n in notifs))
        self.assertTrue(any(n.type == "REPLENISHMENT" for n in notifs))

    def test_get_user_notifications_filtered(self):
        disabled_prefs = ReminderPreferences(
            am_routine_enabled=False,
            pm_routine_enabled=False,
            hydration_enabled=False,
            sleep_enabled=False,
            replenishment_alerts_enabled=False,
            progress_photo_reminders_enabled=False
        )
        filtered = NotificationEngine.get_user_notifications(disabled_prefs)
        self.assertEqual(len(filtered), 2)
        self.assertTrue(any(n.type == "PLATFORM" for n in filtered))
        self.assertTrue(any(n.type == "MOTIVATIONAL" for n in filtered))

    def test_replenishment_forecast(self):
        forecasts = NotificationEngine.get_replenishment_forecast()
        self.assertGreaterEqual(len(forecasts), 4)
        sunscreen = next((p for p in forecasts if "Sunscreen" in p.product_name), None)
        self.assertIsNotNone(sunscreen)
        self.assertEqual(sunscreen.status, "CRITICAL")
        self.assertLessEqual(sunscreen.days_remaining, 5)

    def test_create_test_notification(self):
        test_item = NotificationEngine.create_test_notification("HYDRATION", "Water Time", "Drink 500ml")
        self.assertEqual(test_item.type, "HYDRATION")
        self.assertEqual(test_item.title, "Water Time")
        self.assertFalse(test_item.read)

if __name__ == "__main__":
    unittest.main()
