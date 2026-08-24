package com.voxonlabs.evercommons.proof

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.voxonlabs.evercommons.proof.ui.EverCommonsApp
import com.voxonlabs.evercommons.proof.ui.theme.EverCommonsTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            EverCommonsTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    EverCommonsApp()
                }
            }
        }
    }
}
