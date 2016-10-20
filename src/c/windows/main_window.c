#include "main_window.h"
#include "private.h"

static Window *s_main_window;

static void handle_select_click(ClickRecognizerRef recognizer, void *context) {
    // TODO: show selected menu
    //text_layer_set_text(s_title_layer, "Select");
}

static void handle_up_click(ClickRecognizerRef recognizer, void *context) {
    // TODO: change views to previous data point
    //text_layer_set_text(s_title_layer, "Up");
}

static void handle_down_click(ClickRecognizerRef recognizer, void *context) {
    // TODO: change views to next data point
    //text_layer_set_text(s_title_layer, "Down");
}

static void click_config_provider(void *context) {
    window_single_click_subscribe(BUTTON_ID_SELECT, handle_select_click);
    window_single_click_subscribe(BUTTON_ID_UP, handle_up_click);
    window_single_click_subscribe(BUTTON_ID_DOWN, handle_down_click);
}

static void main_window_load(Window *window) {
    Layer *window_layer = window_get_root_layer(window);
    GRect bounds = layer_get_bounds(window_layer);

    MainWindowData *data = window_get_user_data(window);

    data->title_layer = text_layer_create(GRect(0, 10, bounds.size.w, 20));
    text_layer_set_text_alignment(data->title_layer, GTextAlignmentLeft);
    text_layer_set_text(data->title_layer, "Mensa der Ruhr-Uni-Bochum");

    data->start_layer = text_layer_create(GRect(0, 60, bounds.size.w, 20));
    text_layer_set_text_alignment(data->start_layer, GTextAlignmentLeft);
    text_layer_set_text(data->start_layer, "10:00 Uhr");

    data->end_layer = text_layer_create(GRect(0, 80, bounds.size.w, 20));
    text_layer_set_text_alignment(data->end_layer, GTextAlignmentLeft);
    text_layer_set_text(data->end_layer, "14:00 Uhr");

    layer_add_child(window_layer, text_layer_get_layer(data->title_layer));
    layer_add_child(window_layer, text_layer_get_layer(data->start_layer));
    layer_add_child(window_layer, text_layer_get_layer(data->end_layer));
}

static void main_window_unload(Window *window) {
    MainWindowData *data = window_get_user_data(window);

    text_layer_destroy(data->title_layer);
    text_layer_destroy(data->start_layer);
    text_layer_destroy(data->end_layer);
}

void main_window_push() {
    if (!s_main_window) {
        // init user-data for main window
        MainWindowData *data = malloc(sizeof(MainWindowData));
        memset(data, 0, sizeof(MainWindowData));

        s_main_window = window_create();
        window_set_user_data(s_main_window, data);

        window_set_click_config_provider(s_main_window, click_config_provider);
        window_set_window_handlers(s_main_window, (WindowHandlers) {
            .load = main_window_load,
            .unload = main_window_unload,
        });
    }

    window_stack_push(s_main_window, true);
}

void main_window_deinit() {
    if (!s_main_window) {
        window_destroy(s_main_window);
    }
}
