package com.voxonlabs.evercommons.benchmark

import androidx.benchmark.macro.junit4.BaselineProfileRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.LargeTest
import androidx.test.uiautomator.By
import androidx.test.uiautomator.Until
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@LargeTest
@RunWith(AndroidJUnit4::class)
class BaselineProfileGenerator {
    @get:Rule
    val rule = BaselineProfileRule()

    @Test
    fun generate() = rule.collect(
        packageName = "com.voxonlabs.evercommons.proof",
        includeInStartupProfile = true,
    ) {
        pressHome()
        startActivityAndWait()
        device.wait(Until.hasObject(By.res("continue_demo")), 5_000)
        device.findObject(By.res("continue_demo"))?.click()
        device.wait(Until.hasObject(By.res("feed_list")), 5_000)
        device.findObject(By.res("nav_profile"))?.click()
        device.wait(Until.hasObject(By.res("screen_profile")), 5_000)
    }
}
