#include "communication.h"

const uint32_t inbox_size = 64;
const uint32_t outbox_size = 32;

static bool s_js_ready = false;
static CommIsReadyCallback s_ready_callback = NULL;

// a new message has been successfully received
static void inbox_received_callback(DictionaryIterator *iter, void *context) {
    // check if PebbleKit JS is ready
    if (!s_js_ready) {
        Tuple *ready_tuple = dict_find(iter, MESSAGE_KEY_JSReady);
        if (ready_tuple) {
            // PebbleKit JS ready. Start communication
            s_js_ready = true;
            if (s_ready_callback != NULL) {
                s_ready_callback(s_js_ready);
            }
        }
    }

    Tuple *test_tuple = dict_find(iter, MESSAGE_KEY_TestKey);
    if (test_tuple) {
        uint8_t *number = test_tuple->value->data;
        char text[32];
        strcpy(text, (char*)(test_tuple->value->data + 1));

        char buffer[128];
        snprintf(buffer, 128, "Got values %d and \"%s\"", *number, text);

        APP_LOG(APP_LOG_LEVEL_DEBUG, "RECEIVED MESSAGE: %s", buffer);
    }
}

// a message was received, but had to be dropped
static void inbox_dropped_callback(AppMessageResult reason, void *context) {
    APP_LOG(APP_LOG_LEVEL_ERROR, "Message dropped. Reason: %d", (int)reason);
}

// the message just sent has been successfully delivered
static void outbox_sent_callback(DictionaryIterator *iter, void *context) {
}

// the message just sent failed to be delivered
static void outbox_failed_callback(DictionaryIterator *iter, AppMessageResult reason, void *context) {
    APP_LOG(APP_LOG_LEVEL_ERROR, "Message send failed. Reason: %d", (int)reason);
}

// init the PebbleKit JS message system
void init_message_system() {
    app_message_open(inbox_size, outbox_size);

    app_message_register_inbox_received(inbox_received_callback);
    app_message_register_inbox_dropped(inbox_dropped_callback);
    app_message_register_outbox_sent(outbox_sent_callback);
    app_message_register_outbox_failed(outbox_failed_callback);
}

bool comm_is_ready() {
    return s_js_ready;
}

void comm_register_on_ready(CommIsReadyCallback callback) {
    s_ready_callback = callback;
}

void comm_request_menu(int location) {
    DictionaryIterator *iter;

    AppMessageResult result = app_message_outbox_begin(&iter);
    if (result == APP_MSG_OK) {
        int loc = location;
        dict_write_int(iter, MESSAGE_KEY_GetMenu, &loc, sizeof(int), true);

        result = app_message_outbox_send();
        if(result != APP_MSG_OK) {
            APP_LOG(APP_LOG_LEVEL_ERROR, "Error sending the outbox: %d", (int)result);
        }
    } else {
        APP_LOG(APP_LOG_LEVEL_ERROR, "Error preparing the outbox: %d", (int)result);
    }
}
