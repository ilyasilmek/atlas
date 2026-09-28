package com.promptatlas.core
import java.net.URI
import java.text.Normalizer
import java.util.Locale
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@Serializable data class Prompt(
 val id: String, val title: String, val prompt: String,
 val description: String = "", val model: String = "", val category: String = "",
 val images: List<String> = emptyList(), val tags: List<String> = emptyList(),
 val sourceUrl: String? = null, val authorHandle: String? = null, val createdAt: String? = null,
 val demoArtwork: Int? = null,
 val sourceId: String = "", val sourceName: String = "", val license: String = "",
 val licenseUrl: String = "", val catalogUrl: String = "", val previewImage: String = "",
 val attribution: String = "", val requiresReference: Boolean = false,
)
@Serializable data class CatalogSource(val id: String, val name: String, val count: Int)
@Serializable data class CatalogPage(
 val apiVersion: Int = 1, val items: List<Prompt>, val nextCursor: String? = null,
 val sources: List<CatalogSource> = emptyList(),
 val total: Int = 0, val categories: List<String> = emptyList(), val models: List<String> = emptyList(),
)
@Serializable data class SavedPrompt(val origin: String, val item: Prompt)
object Codec {
 private val json = Json { ignoreUnknownKeys = true; coerceInputValues = true; encodeDefaults = true }
 fun decode(raw: String): CatalogPage = json.decodeFromString<CatalogPage>(raw).also {
  require(it.apiVersion == 1) { "Desteklenmeyen API sürümü" }
  require(it.items.all { p -> p.id.isNotBlank() && p.title.isNotBlank() }) { "Geçersiz katalog" }
 }
 fun encode(page: CatalogPage): String = json.encodeToString(page)
 fun saved(raw: String): List<SavedPrompt> = json.decodeFromString(raw)
 fun encodeSaved(items: List<SavedPrompt>): String = json.encodeToString(items)
}
fun normalizeOrigin(value: String, allowLocalHttp: Boolean = false): String {
 val uri = try { URI(value.trim()) } catch (_: Exception) { throw IllegalArgumentException("Geçerli bir adres girin.") }
 val host = uri.host?.lowercase(Locale.ROOT) ?: throw IllegalArgumentException("Sunucu adresi eksik.")
 val local = host in listOf("localhost", "127.0.0.1", "10.0.2.2") || Regex("10\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}").matches(host) || Regex("192\\.168\\.\\d{1,3}\\.\\d{1,3}").matches(host) || Regex("172\\.(1[6-9]|2[0-9]|3[01])\\.\\d{1,3}\\.\\d{1,3}").matches(host)
 require(uri.scheme == "https" || (allowLocalHttp && local && uri.scheme == "http")) { "HTTPS kullanın. Yerel HTTP yalnızca debug sürümünde desteklenir." }
 require(uri.rawUserInfo == null && uri.rawQuery == null && uri.rawFragment == null && (uri.path.isNullOrBlank() || uri.path == "/")) { "Yalnızca ana adresi girin; /api yolu eklemeyin." }
 require(uri.port == -1 || uri.port in 1..65535) { "Geçersiz port." }
 return URI(uri.scheme, null, host, uri.port, null, null, null).toString()
}
fun searchKey(value: String): String = Normalizer.normalize(value.lowercase(Locale.ROOT).replace('ı', 'i'), Normalizer.Form.NFD).replace(Regex("\\p{M}+"), "")
fun filterPrompts(items: List<Prompt>, query: String, category: String = "", model: String = "", source: String = ""): List<Prompt> {
 val words = searchKey(query).trim().split(Regex("\\s+")).filter { it.isNotBlank() }
 return items.filter { p ->
  val text = searchKey(listOf(p.title,p.prompt,p.description,p.category,p.model,p.sourceName,p.tags.joinToString(" ")).joinToString(" "))
  (source.isBlank() || source == p.sourceId) && (category.isBlank() || category == p.category) && (model.isBlank() || model == p.model) && words.all(text::contains)
 }
}
fun mergePages(a: List<Prompt>, b: List<Prompt>): List<Prompt> = (a + b).distinctBy { it.id }
object DemoCatalog {
 val items = listOf(
  Prompt("demo-orbit","Yörüngenin ötesinde","Create a minimalist editorial poster of a lavender planet, thin golden orbital rings and small warm stars over a deep indigo horizon. Clean geometric shapes, generous negative space, no text, vertical 3:4.","Uzay temalı geometrik poster fikri.","Model bağımsız","artStyles",tags=listOf("uzay","poster"),demoArtwork=0),
  Prompt("demo-peaks","Sessiz zirveler","Create a layered paper-cut landscape with terracotta mountains, a pale peach sun and deep midnight blue sky. Crisp sculptural silhouettes, refined travel-poster composition, no text, vertical 3:4.","Katmanlar ve sıcak renklerle manzara.","Model bağımsız","scenes",tags=listOf("manzara","dağ"),demoArtwork=1),
  Prompt("demo-bloom","Renklerin ritmi","Design an abstract botanical art print with oversized coral and lavender petals around a golden center on a cream backdrop. Bold organic shapes, flat colors, no lettering, vertical format.","Soyut botanik kompozisyonu.","Model bağımsız","artStyles",tags=listOf("çiçek","renk"),demoArtwork=2),
  Prompt("demo-arch","Işığın mimarisi","Minimalist architectural illustration of nested arched doorways in sandy beige, muted peach and deep plum, a long diagonal shadow, tiny golden sun, contemporary gallery poster, no text, vertical 3:4.","Kemerler ve gölgelerle mimari çalışma.","Model bağımsız","designUi",tags=listOf("mimari","kemer"),demoArtwork=3),
  Prompt("demo-wave","Mavi saat","Create an abstract ocean poster with sweeping layered turquoise and navy waves beneath a coral sun. Smooth curves, strong silhouette, spacious sky, no text, vertical composition.","Akışkan çizgiler ve deniz tonları.","Model bağımsız","scenes",tags=listOf("deniz","dalga"),demoArtwork=4),
  Prompt("demo-balance","Denge çalışması","Create a still-life graphic poster with a terracotta sphere balanced on a lavender column beside a golden disc. Midnight blue background, precise geometric composition, no text, vertical 3:4.","Geometrik nesnelerle stüdyo fikri.","Model bağımsız","productCommercial",tags=listOf("ürün","geometri"),demoArtwork=5),
 )
 fun page(q: String = "", c: String = "", m: String = ""): CatalogPage {
  val filtered=filterPrompts(items,q,c,m)
  return CatalogPage(items=filtered,total=filtered.size,categories=items.map{it.category}.distinct(),models=items.map{it.model}.distinct())
 }
}

/** Page after filtering, with stable source counts for the complete collection. */
fun catalogPage(items: List<Prompt>, query: String = "", category: String = "", model: String = "", source: String = "", cursor: String? = null, pageSize: Int = 30): CatalogPage {
 require(pageSize in 1..100)
 val offset = cursor?.toIntOrNull() ?: if (cursor == null) 0 else throw IllegalArgumentException("Geçersiz sayfa")
 require(offset >= 0)
 val filtered = filterPrompts(items, query, category, model, source)
 val page = filtered.drop(offset).take(pageSize)
 val next = if (offset.toLong() + page.size < filtered.size) (offset + page.size).toString() else null
 return CatalogPage(items = page, nextCursor = next, total = filtered.size,
  categories = items.map { it.category }.filter { it.isNotBlank() }.distinct().sorted(),
  models = items.map { it.model }.filter { it.isNotBlank() }.distinct().sorted(),
  sources = items.groupBy { it.sourceId }.map { (id, values) -> CatalogSource(id, values.first().sourceName, values.size) })
}
