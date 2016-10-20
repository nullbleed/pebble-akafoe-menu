#include "communication.h"

const uint32_t inbox_size = 64;
const uint32_t outbox_size = 32;

static void inbox_received_callback(DictionaryIterator *iter, void *context) {
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

// init the PebbleKit JS message system
void init_message_system() {
    app_message_open(inbox_size, outbox_size);

    app_message_register_inbox_received(inbox_received_callback);
}
