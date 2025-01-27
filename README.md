# Birthday Calendar

A Flutter application designed to track birthdays and other recurring significant events. The app allows you to manage events such as birthdays, anniversaries, holidays, and custom events with a wide range of features.

## Features

- **Event Management:** 
  - Add, edit, delete, and move events to the trash.
  - Create folders to organize events.
  - Customize event types: Birthday, Anniversary, Holiday, Death, or Custom.
  - Set both the date and time for each event.
  - Count down to events with precise tracking (down to the second).
  
- **Contact Integration:** 
  - Link events to contacts and pull their profile photos.
  - Import events from contacts directly.
  
- **Reminders and Notifications:** 
  - Set reminders for events with flexible scheduling.
  
- **Sorting & Searching:**
  - Sort events by relevance, name, age, zodiac, and event type.
  - Search for events across all categories.

- **User Preferences:**
  - Customize theme, color palette, language, date format, and first day of the week.
  - Hide avatars and display past events in the main list.

- **Backup & Restore:** 
  - Backup your events and restore them as needed.

## Dependencies

This app uses several dependencies to provide advanced functionality, including local notifications, database management, and contact synchronization:

- **Google Services:**
  - `google_sign_in`
  - `googleapis`
  - `googleapis_auth`

- **Database:**
  - `hive`
  - `hive_flutter`

- **File Management:**
  - `path_provider`
  - `external_path`
  - `file_picker`

- **Image Handling:**
  - `image_picker`
  - `flutter_image_converter`
  - `flutter_image_compress`

- **Notifications:**
  - `flutter_local_notifications`
  - `timezone`
  - `flutter_timezone`

- **UI Components:**
  - `table_calendar`
  - `flutter_switch`
  - `flutter_staggered_grid_view`
  - `shimmer_animation`
  - `confetti`

- **Utility Libraries:**
  - `easy_localization`
  - `permission_handler`
  - `url_launcher`
  - `app_settings`

For the full list of dependencies, check the `pubspec.yaml` file.
