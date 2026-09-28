package com.promptatlas.core
import java.io.File
import org.junit.Assert.*
import org.junit.Assume.assumeTrue
import org.junit.Test
class BundledCatalogTest {
 @Test fun decodesAndPaginatesTheShippedCatalog() {
  val file=File(System.getProperty("atlas.catalog.path")?:"../app/src/main/assets/catalog/catalog.json")
  assumeTrue("Catalog import must finish first",file.exists())
  val catalog=Codec.decode(file.readText())
  assertTrue(catalog.items.size>=1000)
  assertEquals(catalog.total,catalog.items.size)
  assertEquals(3,catalog.items.map{it.sourceId}.distinct().size)
  assertTrue(catalog.items.all{it.prompt.isNotBlank()&&it.images.isNotEmpty()&&it.previewImage.startsWith("file:///android_asset/catalog/images/")&&it.demoArtwork==null})
  var cursor:String?=null;val seen=mutableSetOf<String>()
  do {
   val page=catalogPage(catalog.items,cursor=cursor)
   page.items.forEach{assertTrue(seen.add(it.id))}
   cursor=page.nextCursor
  } while(cursor!=null)
  assertEquals(catalog.items.size,seen.size)
 }
}
