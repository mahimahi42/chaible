#include "chaible.h"

int main(void)
{
    main_init();
    app_event_loop();
    main_deinit();
}

// Handler for main window loading
void main_window_load(Window* window)
{}

// Handler for splash screen loading
void splash_window_load(Window* window)
{
    Layer* window_layer = window_get_root_layer(splash_window);
    GRect bounds = layer_get_frame(window_layer);

    splash_layer = bitmap_layer_create(bounds);
    splash_bitmap = gbitmap_create_with_resource(RESOURCE_ID_SPLASH);
    bitmap_layer_set_bitmap(splash_layer, splash_bitmap);
    layer_add_child(window_layer, bitmap_layer_get_layer(splash_layer));

    app_timer_register(3000, &finish_splash, NULL);
}

// Handler for main window unloading
void main_window_unload(Window* window)
{}

// Handler for splash screen unloading
void splash_window_unload(Window* window)
{
    gbitmap_destroy(splash_bitmap);
    bitmap_layer_destroy(splash_layer);
}

// Create the main window
void main_init()
{
    main_window = window_create();
    window_set_fullscreen(main_window, FULLSCREEN);
    window_set_background_color(main_window, GColorBlack);
    window_set_window_handlers(main_window, (WindowHandlers) {
        .load = main_window_load,
        .unload = main_window_unload,
    });
    window_stack_push(main_window, ANIMATED);
    if (SHOW_SPLASH) {
        SHOW_SPLASH = false;
        splash_init();
    }
}

// Create the splash screen
void splash_init()
{
    splash_window = window_create();
    window_set_fullscreen(splash_window, FULLSCREEN);
    window_set_window_handlers(splash_window, (WindowHandlers) {
        .load = splash_window_load,
        .unload = splash_window_unload,
    });
    window_stack_push(splash_window, ANIMATED);
}

// Destroy the main window
void main_deinit()
{
    window_destroy(main_window);
}

// Destroy the splash screen
void splash_deinit()
{
    window_destroy(splash_window);
}

// Splash Window AppTimer callback
void finish_splash(void* data)
{
    window_stack_pop(ANIMATED);
}
