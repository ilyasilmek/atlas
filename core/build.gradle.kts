plugins { id("org.jetbrains.kotlin.jvm"); id("org.jetbrains.kotlin.plugin.serialization") }
kotlin { jvmToolchain(17) }
dependencies { implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.9.0"); testImplementation("junit:junit:4.13.2") }

tasks.test {
 val catalogDir=rootProject.file("app/src/main/assets/catalog")
 inputs.dir(catalogDir)
 systemProperty("atlas.catalog.path",catalogDir.resolve("catalog.json").absolutePath)
}
