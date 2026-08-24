package com.voxonlabs.evercommons.proof.ui

sealed class Dest(val route: String, val label: String) {
    data object Onboarding : Dest("onboarding", "Onboarding")
    data object Feed : Dest("feed", "Feed")
    data object Upload : Dest("upload", "Upload")
    data object Profile : Dest("profile", "Profile")
    data object Report : Dest("report", "Report")
    data object Safety : Dest("safety", "Safety")
    data object Creator : Dest("creator", "Creator")
    data object Capacity : Dest("capacity", "Capacity")

    companion object {
        val bottomNav: List<Dest> = listOf(Feed, Upload, Profile, Report, Safety, Creator, Capacity)
    }
}
