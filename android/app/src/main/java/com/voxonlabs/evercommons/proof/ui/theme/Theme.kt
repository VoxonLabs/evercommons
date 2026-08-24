package com.voxonlabs.evercommons.proof.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val Ink = Color(0xFF15202B)
private val Paper = Color(0xFFF7F4EF)
private val Accent = Color(0xFF0F6E56)
private val Muted = Color(0xFF5B6670)

private val LightColors = lightColorScheme(
    primary = Accent,
    onPrimary = Color.White,
    background = Paper,
    onBackground = Ink,
    surface = Color.White,
    onSurface = Ink,
    secondary = Muted,
    onSecondary = Color.White,
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFF5DCAA5),
    onPrimary = Ink,
    background = Color(0xFF101820),
    onBackground = Paper,
    surface = Color(0xFF182230),
    onSurface = Paper,
    secondary = Color(0xFF9AA7B2),
    onSecondary = Ink,
)

@Composable
fun EverCommonsTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        content = content,
    )
}
