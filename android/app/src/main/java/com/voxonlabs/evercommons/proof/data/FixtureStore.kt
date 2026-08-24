package com.voxonlabs.evercommons.proof.data

data class SamplePost(
    val id: String,
    val title: String,
    val by: String,
    val caption: String,
    val explicit: Boolean = false,
    val feeds: Set<String>,
    val archiveOrigin: ArchiveOrigin? = null,
)

data class ArchiveOrigin(
    val platform: String,
    val likes: String,
    val date: String,
)

object FixtureStore {
    val handle: String = "local-demo"

    val posts: List<SamplePost> = listOf(
        SamplePost(
            id = "bridge",
            title = "Morning bridge walk",
            by = "sample.maker",
            caption = "Quiet light over the river. Sample only.",
            feeds = setOf("following", "latest", "discovery"),
        ),
        SamplePost(
            id = "workshop",
            title = "Open workshop notes",
            by = "sample.lab",
            caption = "Transparent process beats closed metrics.",
            feeds = setOf("latest", "discovery"),
        ),
        SamplePost(
            id = "ceramics",
            title = "Studio ceramic series",
            by = "sample.craft",
            caption = "Curated showcase post from creator's personal export archive.",
            feeds = setOf("following", "latest", "discovery"),
            archiveOrigin = ArchiveOrigin(
                platform = "Instagram archive",
                likes = "1.4k",
                date = "2025-04",
            ),
        ),
        SamplePost(
            id = "restricted",
            title = "Restricted sample",
            by = "sample.edge",
            caption = "Marked explicit for safety UI testing.",
            explicit = true,
            feeds = setOf("latest"),
        ),
    )

    fun forFeed(feed: String): List<SamplePost> = posts.filter { feed in it.feeds }
}
