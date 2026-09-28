package com.promptatlas.core
import org.junit.Assert.*
import org.junit.Test
class MultiSourceTest {
 private fun item(id: Int, source: String) = Prompt("$source:$id", "Image $id", "Full prompt $id", model="Model", category="artStyles", sourceId=source, sourceName=source)
 @Test fun paginatesAfterSourceAndSearchFiltering() {
  val items=(0..72).map { item(it,if(it%2==0)"a" else "b") }
  val first=catalogPage(items,source="a");val second=catalogPage(items,source="a",cursor=first.nextCursor)
  assertEquals(37,first.total);assertEquals(30,first.items.size);assertEquals(7,second.items.size)
  assertEquals(37,(first.items+second.items).map{it.id}.distinct().size);assertNull(second.nextCursor)
  assertEquals(1,catalogPage(items,query="Image 72",source="a").total)
  assertEquals(0,catalogPage(items,query="Image 72",source="b").total)
 }
 @Test fun attributionSurvivesFavoritesRoundTrip() {
  val p=item(1,"source").copy(license="CC-BY-4.0",licenseUrl="https://creativecommons.org/licenses/by/4.0/",requiresReference=true,previewImage="file:///android_asset/catalog/images/a.webp")
  assertEquals(p,Codec.saved(Codec.encodeSaved(listOf(SavedPrompt("",p)))).single().item)
 }
 @Test fun emptyAndInvalidCursorsAreHandled() {
  assertNull(catalogPage(emptyList()).nextCursor)
  assertThrows(IllegalArgumentException::class.java){catalogPage(emptyList(),cursor="-1")}
  assertThrows(IllegalArgumentException::class.java){catalogPage(emptyList(),cursor="bad")}
 }
}
