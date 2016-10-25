#pragma once
#include <pebble.h>

typedef void(* CommIsReadyCallback)(bool is_ready);

void init_message_system();
bool comm_is_ready();
void comm_register_on_ready(CommIsReadyCallback callback);
void comm_request_menu(int);
