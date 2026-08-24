package com.voxonlabs.evercommons.proof.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.testTagsAsResourceId
import androidx.compose.ui.unit.dp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.voxonlabs.evercommons.proof.data.FixtureStore
import com.voxonlabs.evercommons.proof.data.SamplePost
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class, ExperimentalComposeUiApi::class)
@Composable
fun EverCommonsApp() {
    val navController = rememberNavController()
    val snackbar = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    var explicitMode by rememberSaveable { mutableStateOf("blur") }
    val backStack by navController.currentBackStackEntryAsState()
    val route = backStack?.destination?.route
    val showBottom = route != null && route != Dest.Onboarding.route

    Scaffold(
        modifier = Modifier
            .semantics { testTagsAsResourceId = true }
            .testTag("app_root"),
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("EverCommons")
                        Text(
                            text = "Demo handle: ${FixtureStore.handle}",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.secondary,
                        )
                    }
                },
            )
        },
        bottomBar = {
            if (showBottom) {
                NavigationBar(modifier = Modifier.testTag("bottom_nav")) {
                    Dest.bottomNav.forEach { dest ->
                        NavigationBarItem(
                            selected = route == dest.route,
                            onClick = {
                                navController.navigate(dest.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Text(dest.label.take(1)) },
                            label = { Text(dest.label) },
                            modifier = Modifier
                                .testTag("nav_${dest.route}")
                                .semantics { contentDescription = "nav_${dest.route}" },
                        )
                    }
                }
            }
        },
        snackbarHost = { SnackbarHost(snackbar) },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
        ) {
            Text(
                text = "Offline native proof. No account. No uploads. No network.",
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
                    .testTag("status_banner"),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.secondary,
            )
            NavHost(
                navController = navController,
                startDestination = Dest.Onboarding.route,
                modifier = Modifier.fillMaxSize(),
            ) {
                composable(Dest.Onboarding.route) {
                    OnboardingScreen(
                        onContinue = {
                            navController.navigate(Dest.Feed.route) {
                                popUpTo(Dest.Onboarding.route) { inclusive = true }
                            }
                        },
                    )
                }
                composable(Dest.Feed.route) {
                    FeedScreen(explicitMode = explicitMode)
                }
                composable(Dest.Upload.route) {
                    UploadScreen(
                        onBlocked = { message ->
                            scope.launch { snackbar.showSnackbar(message) }
                        },
                    )
                }
                composable(Dest.Profile.route) { ProfileScreen() }
                composable(Dest.Report.route) {
                    ReportScreen(
                        onSubmitted = { message ->
                            scope.launch { snackbar.showSnackbar(message) }
                        },
                    )
                }
                composable(Dest.Safety.route) {
                    SafetyScreen(
                        explicitMode = explicitMode,
                        onModeChange = { explicitMode = it },
                    )
                }
                composable(Dest.Creator.route) { CreatorScreen() }
                composable(Dest.Capacity.route) { CapacityScreen() }
            }
        }
    }
}

@Composable
private fun OnboardingScreen(onContinue: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
            .testTag("screen_onboarding"),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Enter as a local demo", style = MaterialTheme.typography.headlineMedium)
        Text(
            "This Compose proof does not register you, store an email, or talk to an identity provider. Passkeys stay in the separate Shield prototype.",
        )
        Fact("Login", "Not collected here")
        Fact("Shield", "Derived yes/no only")
        Fact("Uploads", "Stubbed")
        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("What the app is allowed to know", style = MaterialTheme.typography.titleMedium)
                Text(
                    """
                    {
                      "verified_human": true,
                      "age_over_18": true,
                      "account_eligible": true
                    }
                    """.trimIndent(),
                    style = MaterialTheme.typography.bodySmall,
                )
                Text("No name, date of birth, address, document, or selfie.")
            }
        }
        Button(
            onClick = onContinue,
            modifier = Modifier
                .testTag("continue_demo")
                .semantics { contentDescription = "continue_as_local_demo" },
        ) {
            Text("Continue as local demo")
        }
        Text(
            "Adult pilot only. No private messages. No minors. Recovery after device loss is not implemented.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.secondary,
        )
    }
}

@Composable
private fun FeedScreen(explicitMode: String) {
    var feed by rememberSaveable { mutableStateOf("following") }
    val posts = FixtureStore.forFeed(feed)
    Column(
        modifier = Modifier
            .fillMaxSize()
            .testTag("screen_feed"),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            listOf("following", "latest", "discovery").forEach { name ->
                FilterChip(
                    selected = feed == name,
                    onClick = { feed = name },
                    label = { Text(name.replaceFirstChar { it.uppercase() }) },
                    modifier = Modifier.testTag("feed_tab_$name"),
                )
            }
        }
        if (posts.isEmpty()) {
            Text(
                "No posts in this feed.",
                modifier = Modifier
                    .padding(16.dp)
                    .testTag("feed_empty"),
            )
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .testTag("feed_list"),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                items(posts, key = { it.id }) { post ->
                    PostCard(post = post, explicitMode = explicitMode)
                }
            }
        }
    }
}

@Composable
private fun PostCard(post: SamplePost, explicitMode: String) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("post_${post.id}"),
    ) {
        Column(
            Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(post.title, style = MaterialTheme.typography.titleMedium)
            Text("by ${post.by}", color = MaterialTheme.colorScheme.secondary)
            if (post.explicit && explicitMode == "blur") {
                Text(
                    "Explicit sample blurred by safety setting.",
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.testTag("explicit_blur_${post.id}"),
                )
            } else {
                Text(post.caption)
            }
            post.archiveOrigin?.let { origin ->
                Text(
                    "Archived Post · Origin metric: ~${origin.likes} likes on ${origin.platform} (${origin.date}) · Feed neutral",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.secondary,
                    modifier = Modifier.testTag("archive_badge_${post.id}"),
                )
            }
        }
    }
}

@Composable
private fun UploadScreen(onBlocked: (String) -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
            .testTag("screen_upload"),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Upload and import", style = MaterialTheme.typography.headlineMedium)
        Text("Public uploads are closed until media, quarantine, quotas, and moderation gates exist.")
        OutlinedButton(
            onClick = { onBlocked("Upload blocked in offline proof. Kill switch stays on.") },
            modifier = Modifier.testTag("upload_button"),
        ) {
            Text("Upload (disabled)")
        }
        Text("Choose a file is disabled. Nothing leaves this device.", color = MaterialTheme.colorScheme.secondary)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Curated archive import (90-day bridge)", style = MaterialTheme.typography.titleMedium)
        Text("Client-side unpack only; no bulk backend uploads. Disabled in this proof.")
        OutlinedButton(
            onClick = {
                onBlocked(
                    "Archive import blocked. Requires local unpacking, selective curation, and sanitized private intake.",
                )
            },
            modifier = Modifier.testTag("archive_button"),
        ) {
            Text("Scan archive locally (disabled)")
        }
    }
}

@Composable
private fun ProfileScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .testTag("screen_profile"),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Profile", style = MaterialTheme.typography.headlineMedium)
        Text(FixtureStore.handle, style = MaterialTheme.typography.titleLarge)
        Text("Sample public profile. This is not a production account.")
        Fact("Posts", "${FixtureStore.posts.size} sample")
        Fact("Export", "Not wired")
        Fact("Delete", "Not wired")
    }
}

@Composable
private fun ReportScreen(onSubmitted: (String) -> Unit) {
    var reason by rememberSaveable { mutableStateOf("spam") }
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .testTag("screen_report"),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Report / appeal", style = MaterialTheme.typography.headlineMedium)
        Text("Local-only form. No report is stored or sent.")
        listOf("spam", "abuse", "illegal", "other").forEach { value ->
            FilterChip(
                selected = reason == value,
                onClick = { reason = value },
                label = { Text(value) },
                modifier = Modifier.testTag("report_reason_$value"),
            )
        }
        Button(
            onClick = { onSubmitted("Report stub recorded locally as $reason. Nothing left this device.") },
            modifier = Modifier.testTag("report_submit"),
        ) {
            Text("Submit report stub")
        }
    }
}

@Composable
private fun SafetyScreen(explicitMode: String, onModeChange: (String) -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .testTag("screen_safety"),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Safety controls", style = MaterialTheme.typography.headlineMedium)
        Text("Explicit-content default for the sample feed.")
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("blur", "hide", "show").forEach { mode ->
                FilterChip(
                    selected = explicitMode == mode,
                    onClick = { onModeChange(mode) },
                    label = { Text(mode) },
                    modifier = Modifier.testTag("explicit_mode_$mode"),
                )
            }
        }
        Text("No global trust score. Decisions stay reasoned and appealable in a real pilot.")
    }
}

@Composable
private fun CreatorScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .testTag("screen_creator"),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Creator dashboard", style = MaterialTheme.typography.headlineMedium)
        Fact("Shadow revenue", "0.00 sample units")
        Fact("Sponsorship", "None")
        Text("Why this ad: contextual only. No tracking pixels.")
        AssistChip(onClick = {}, label = { Text("Export ledger (stub)") })
    }
}

@Composable
private fun CapacityScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .testTag("screen_capacity"),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Capacity", style = MaterialTheme.typography.headlineMedium)
        Text("12 / 100 sample pilot seats. Waitlist is not collecting emails here.")
        Fact("Upload kill switch", "ON")
        Fact("Daily project cap", "Closed")
        Fact("Measured cost", "Not sampled yet")
    }
}

@Composable
private fun Fact(label: String, value: String) {
    Column {
        Text(label, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.secondary)
        Text(value, style = MaterialTheme.typography.bodyLarge)
    }
}
