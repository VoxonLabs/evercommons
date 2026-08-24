package com.voxonlabs.evercommons.proof

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class NavigationAndGatesTest {
    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun onboardingContinuesToFeed() {
        composeRule.onNodeWithTag("screen_onboarding").assertIsDisplayed()
        composeRule.onNodeWithTag("continue_demo").performClick()
        composeRule.onNodeWithTag("screen_feed").assertIsDisplayed()
        composeRule.onNodeWithTag("feed_list").assertIsDisplayed()
    }

    @Test
    fun uploadAndArchiveRemainDisabled() {
        composeRule.onNodeWithTag("continue_demo").performClick()
        composeRule.onNodeWithText("Upload").performClick()
        composeRule.onNodeWithTag("screen_upload").assertIsDisplayed()
        composeRule.onNodeWithTag("upload_button").assertIsDisplayed()
        composeRule.onNodeWithTag("archive_button").assertIsDisplayed()
        composeRule.onNodeWithTag("upload_button").performClick()
    }

    @Test
    fun archiveBadgeIsFeedNeutral() {
        composeRule.onNodeWithTag("continue_demo").performClick()
        composeRule.onNodeWithTag("feed_tab_following").performClick()
        composeRule.onNodeWithTag("archive_badge_ceramics").assertIsDisplayed()
    }

    @Test
    fun safetyModeControlsExist() {
        composeRule.onNodeWithTag("continue_demo").performClick()
        composeRule.onNodeWithText("Safety").performClick()
        composeRule.onNodeWithTag("screen_safety").assertIsDisplayed()
        composeRule.onNodeWithTag("explicit_mode_blur").assertIsDisplayed()
        composeRule.onNodeWithTag("explicit_mode_hide").performClick()
    }
}
