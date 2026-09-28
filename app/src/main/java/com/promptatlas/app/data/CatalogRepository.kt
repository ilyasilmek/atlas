package com.promptatlas.app.data
import android.content.Context
import android.util.AtomicFile
import com.promptatlas.app.BuildConfig
import com.promptatlas.core.*
import java.io.File
import java.io.IOException
import java.security.MessageDigest
import java.util.concurrent.TimeUnit
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.HttpUrl.Companion.toHttpUrl
class CatalogRepository(context: Context) {
 private val assets=context.assets
 private val bundled by lazy { Codec.decode(assets.open("catalog/catalog.json").bufferedReader().use { it.readText() }).items }
 private val prefs=context.getSharedPreferences("atlas",Context.MODE_PRIVATE)
 private val dir=File(context.filesDir,"catalog").apply{mkdirs()}
 private val client=OkHttpClient.Builder().callTimeout(25,TimeUnit.SECONDS).connectTimeout(12,TimeUnit.SECONDS).followSslRedirects(false).build()
 val origin get()=prefs.getString("origin",BuildConfig.DEFAULT_ORIGIN).orEmpty()
 val dark get()=prefs.getBoolean("dark",true)
 fun setOrigin(value:String) { prefs.edit().putString("origin",value).apply() }
 fun setDark(value:Boolean) { prefs.edit().putBoolean("dark",value).apply() }
 fun favorites()=runCatching{Codec.saved(prefs.getString("favorites","[]")!!)}.getOrDefault(emptyList())
 fun saveFavorites(items:List<SavedPrompt>) { prefs.edit().putString("favorites",Codec.encodeSaved(items)).apply() }
 suspend fun fetch(origin:String,q:String,c:String,m:String,cursor:String?=null,source:String=""):CatalogPage=withContext(Dispatchers.IO) {
  if(origin.isBlank()) return@withContext catalogPage(bundled,q,c,m,source,cursor)
  val base=normalizeOrigin(origin,BuildConfig.DEBUG)
  val url="$base/api/mobile/v1/prompts".toHttpUrl().newBuilder().addQueryParameter("limit","30").apply {
   if(q.isNotBlank()) addQueryParameter("q",q)
   if(c.isNotBlank()) addQueryParameter("category",c)
   if(m.isNotBlank()) addQueryParameter("model",m)
   cursor?.let{addQueryParameter("cursor",it)}
  }.build()
  val request=Request.Builder().url(url).header("Accept","application/json").header("User-Agent","PromptAtlas/${BuildConfig.VERSION_NAME}").build()
  client.newCall(request).execute().use { response ->
   if(!response.isSuccessful) throw IOException(when(response.code) { 404->"Mobil API bulunamadı. Sunucuya backend eklentisini kurun.";503->"Sunucunun veritabanı yapılandırılmamış.";else->"Sunucu yanıtı: ${response.code}. Yeniden deneyin." })
   val body=response.body?:throw IOException("Sunucu boş yanıt döndürdü.")
   val output=java.io.ByteArrayOutputStream()
   body.byteStream().use { input ->
    val buffer=ByteArray(8192)
    while(true) { val n=input.read(buffer);if(n<0) break;if(output.size()+n>8*1024*1024) throw IOException("Katalog yanıtı çok büyük.");output.write(buffer,0,n) }
   }
   try { Codec.decode(output.toString("UTF-8")) } catch (_:Exception) { throw IOException("Uyumsuz sunucu yanıtı. Mobil API v1 eklentisini kontrol edin.") }
  }
 }
 private fun file(origin:String):AtomicFile {
  val key=MessageDigest.getInstance("SHA-256").digest(origin.toByteArray()).joinToString(""){"%02x".format(it)}
  return AtomicFile(File(dir,"$key.json"))
 }
 suspend fun cached(origin:String):CatalogPage?=withContext(Dispatchers.IO) { runCatching { Codec.decode(file(origin).openRead().bufferedReader().use{it.readText()}) }.getOrNull() }
 suspend fun cache(origin:String,page:CatalogPage)=withContext(Dispatchers.IO) {
  val f=file(origin);val stream=f.startWrite()
  try { stream.write(Codec.encode(page).toByteArray());f.finishWrite(stream) } catch(e:Exception) { f.failWrite(stream);throw e }
 }
}
