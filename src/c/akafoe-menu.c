#include <pebble.h>

#include "windows/main_window.h"

// =============
// app lifecycle
// =============

// init main window and request update
static void app_init() {
    main_window_push();
}

// deinit main window
static void app_deinit() {
    main_window_deinit();
}

// app entry (start from here)
int main(void) {
    app_init();
    app_event_loop();
    app_deinit();
}
