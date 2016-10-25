#include <pebble.h>

#include "communication.h"
#include "windows/main_window.h"

// =============
// app lifecycle
// =============

static void pebblekit_ready(bool ready) {
    APP_LOG(APP_LOG_LEVEL_DEBUG, "PebbleKit changed state to READY.");
    comm_request_menu(1);
}

// init main window and request update
static void app_init() {
    init_message_system();
    main_window_push();

    // DEBUG: check reply on phone
    comm_register_on_ready(pebblekit_ready);
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
