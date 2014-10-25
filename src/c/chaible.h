#ifndef CHAIBLE_H
#define CHAIBLE_H

#include <pebble.h>

// Constants
#define ANIMATED true
#define FULLSCREEN true
#define SPLASH_TIME 3000

// Globals
static bool SHOW_SPLASH = true;

// Main Window
static Window* main_window;

// Splash Screen
static Window* splash_window;
static BitmapLayer* splash_layer;
static GBitmap* splash_bitmap;

// Main Window lifecycle
static void main_init(void);
static void main_deinit(void);

// Splash Screen lifecycle
static void splash_init(void);
static void splash_deinit(void);

// Main Window handlers
static void main_window_load(Window*);
static void main_window_unload(Window*);

// Splash Window handlers
static void splash_window_load(Window*);
static void splash_window_unload(Window*);

// Splash Window AppTimerCallback
static void finish_splash(void*);

#endif
