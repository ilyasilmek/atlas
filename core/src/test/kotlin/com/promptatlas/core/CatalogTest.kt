package com.promptatlas.core
import org.junit.Assert.*
import org.junit.Test
class CatalogTest {
 @Test fun acceptsUnknownFieldsAndNullCategory() {
  val p=Codec.decode("""{"items":[{"id":"a","title":"A","prompt":"full","category":null,"future":true}],"nextCursor":"42"}""")
  assertEquals("",p.items.single().category);assertEquals("42",p.nextCursor)
 }
 @Test fun preservesEntirePrompt() {
  val p=Prompt("id","Başlık","line 1\n\"quoted\" — ışık",sourceUrl="https://example.org/source")
  assertEquals(p,Codec.decode(Codec.encode(CatalogPage(items=listOf(p)))).items.single())
 }
 @Test fun rejectsWrongVersion() { assertThrows(IllegalArgumentException::class.java) { Codec.decode("""{"apiVersion":2,"items":[]}""") } }
 @Test fun rejectsHtmlAndWrongContract() {
  assertThrows(Exception::class.java) { Codec.decode("<html>Login</html>") }
  assertThrows(Exception::class.java) { Codec.decode("""{"prompts":[]}""") }
 }
 @Test fun searchesTurkishAndCombinesFilters() {
  assertEquals(1,filterPrompts(DemoCatalog.items,"isigin mimarisi","designUi").size)
  assertEquals(0,filterPrompts(DemoCatalog.items,"isigin","artStyles").size)
 }
 @Test fun deduplicatesPages() { val p=DemoCatalog.items[0];assertEquals(2,mergePages(listOf(p),listOf(p,DemoCatalog.items[1])).size) }
 @Test fun separatesFavoritesByServer() {
  val p=DemoCatalog.items[0];val list=listOf(SavedPrompt("",p),SavedPrompt("https://example.org",p));assertEquals(list,Codec.saved(Codec.encodeSaved(list)))
 }
 @Test fun validatesOrigins() {
  assertEquals("https://example.org",normalizeOrigin(" https://example.org/ "))
  assertEquals("http://10.0.2.2:3000",normalizeOrigin("http://10.0.2.2:3000",true))
  listOf("http://example.org","https://u:p@example.org","https://example.org/api","file:///tmp","https://example.org?q=1").forEach { assertThrows(IllegalArgumentException::class.java) { normalizeOrigin(it) } }
 }
}
