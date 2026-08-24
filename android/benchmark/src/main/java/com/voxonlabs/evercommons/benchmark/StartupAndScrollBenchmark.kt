package com.voxonlabs.evercommons.benchmark

import androidx.benchmark.macro.CompilationMode
import androidx.benchmark.macro.FrameTimingMetric
import androidx.benchmark.macro.StartupMode
import androidx.benchmark.macro.StartupTimingMetric
import androidx.benchmark.macro.junit4.MacrobenchmarkRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.uiautomator.By
import androidx.test.uiautomator.Until
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Macrobenchmark harness for cold start, feed scroll, and navigation.
 * Run with `:benchmark:connectedBenchmarkReleaseAndroidTest`.
 * Emulator results are functional only (EMULATOR error suppressed in this proof);
 * do not claim production smoothness without a mid-range physical device.
 */
@RunWith(AndroidJUnit4::class)
class StartupAndScrollBenchmark {
    @get:Rule
    val benchmarkRule = MacrobenchmarkRule()

    @Test
    fun coldStartup() = benchmarkRule.measureRepeated(
        packageName = PACKAGE,
        metrics = listOf(StartupTimingMetric()),
        iterations = 3,
        startupMode = StartupMode.COLD,
        compilationMode = CompilationMode.Partial(),
    ) {
        pressHome()
        startActivityAndWait()
    }

    @Test
    fun feedScrollAfterContinue() = benchmarkRule.measureRepeated(
        packageName = PACKAGE,
        metrics = listOf(FrameTimingMetric()),
        iterations = 3,
        startupMode = StartupMode.WARM,
        compilationMode = CompilationMode.Partial(),
    ) {
        startActivityAndWait()
        device.wait(Until.hasObject(By.res("continue_demo")), 5_000)
        device.findObject(By.res("continue_demo"))?.click()
        device.wait(Until.hasObject(By.res("feed_list")), 5_000)
        val list = device.findObject(By.res("feed_list"))
        list?.setGestureMargin(device.displayWidth / 5)
        list?.fling(androidx.test.uiautomator.Direction.DOWN)
    }

    companion object {
        private const val PACKAGE = "com.voxonlabs.evercommons.proof"
    }
}
