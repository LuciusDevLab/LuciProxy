package com.luciusdevlab.luciproxy.manager.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = Sky400,
    secondary = Sky500,
    background = Slate900,
    surface = Slate800,
    onPrimary = Slate900,
    onSecondary = Slate900,
    onBackground = TextPrimary,
    onSurface = TextPrimary
)

@Composable
fun LuciProxyTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
