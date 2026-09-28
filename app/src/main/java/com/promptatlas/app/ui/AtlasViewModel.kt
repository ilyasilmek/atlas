package com.promptatlas.app.ui
import android.app.Application
import androidx.compose.runtime.*
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.promptatlas.app.BuildConfig
import com.promptatlas.app.data.CatalogRepository
import com.promptatlas.core.*
import kotlinx.coroutines.*
data class AtlasState(
 val origin:String="",val dark:Boolean=true,val items:List<Prompt> = emptyList(),val favorites:List<SavedPrompt> = emptyList(),
 val source:String="",val sources:List<CatalogSource> = emptyList(),
 val query:String="",val category:String="",val model:String="",val categories:List<String> = emptyList(),val models:List<String> = emptyList(),
 val total:Int=0,val nextCursor:String?=null,val loading:Boolean=false,val loadingMore:Boolean=false,val connecting:Boolean=false,
 val offline:Boolean=false,val error:String?=null,val connectionMessage:String?=null,
)
class AtlasViewModel(app:Application):AndroidViewModel(app) {
 private val repo=CatalogRepository(app)
 var state by mutableStateOf(AtlasState(origin=repo.origin,dark=repo.dark,favorites=repo.favorites()));private set
 private var request:Job?=null;private var more:Job?=null;private var revision=0
 init { refresh() }
 fun query(v:String){state=state.copy(query=v.take(160));refresh(true)}
 fun source(v:String){state=state.copy(source=v);refresh()}
 fun category(v:String){state=state.copy(category=v);refresh()}
 fun model(v:String){state=state.copy(model=v);refresh()}
 fun clear(){state=state.copy(query="",category="",model="",source="");refresh()}
 fun dark(v:Boolean){repo.setDark(v);state=state.copy(dark=v)}
 fun saved(p:Prompt)=state.favorites.any{it.origin==state.origin&&it.item.id==p.id}
 fun favorite(p:Prompt){
  val next=if(saved(p)) state.favorites.filterNot{it.origin==state.origin&&it.item.id==p.id} else state.favorites+SavedPrompt(state.origin,p)
  repo.saveFavorites(next);state=state.copy(favorites=next)
 }
 private fun message(e:Exception)=when(e){is java.net.UnknownHostException->"Sunucu bulunamadı. İnternet bağlantısını kontrol edin.";is java.net.SocketTimeoutException->"Sunucu yanıt vermedi. Yeniden deneyin.";is javax.net.ssl.SSLException->"Sunucunun güvenli bağlantısı doğrulanamadı.";else->e.message?:"Bağlantı kurulamadı."}
 private fun apply(page:CatalogPage){state=state.copy(items=page.items,total=page.total,nextCursor=page.nextCursor,categories=page.categories,models=page.models,sources=page.sources,loading=false,loadingMore=false,offline=false,error=null)}
 fun refresh(debounce:Boolean=false){
  request?.cancel();more?.cancel();val generation=++revision;val s=state
  state=state.copy(loading=true,loadingMore=false,error=null,offline=false)
  request=viewModelScope.launch{
   if(debounce) delay(350)
   try{
    val page=repo.fetch(s.origin,s.query,s.category,s.model,source=s.source)
    if(generation!=revision) return@launch
    apply(page)
    if(s.query.isBlank()&&s.category.isBlank()&&s.model.isBlank()&&s.source.isBlank()&&s.origin.isNotBlank()) runCatching{repo.cache(s.origin,page)}
   }catch(e:CancellationException){throw e}catch(e:Exception){
    val cache=repo.cached(s.origin);if(generation!=revision)return@launch
    state=if(cache!=null) state.copy(items=filterPrompts(cache.items,s.query,s.category,s.model,s.source),categories=cache.categories,models=cache.models,total=cache.items.size,nextCursor=null,loading=false,offline=true,error="Bağlantı kurulamadı. Son kaydedilen içerikler gösteriliyor.")
     else state.copy(items=emptyList(),total=0,nextCursor=null,loading=false,error=message(e))
   }
  }
 }
 fun loadMore(){
  val s=state;val cursor=s.nextCursor?:return;if(s.loading||s.loadingMore)return;val generation=revision
  state=state.copy(loadingMore=true,error=null)
  more=viewModelScope.launch{
   try{
    val page=repo.fetch(s.origin,s.query,s.category,s.model,cursor,s.source);if(generation!=revision)return@launch
    val combined=mergePages(state.items,page.items);state=state.copy(items=combined,nextCursor=page.nextCursor,total=page.total,loadingMore=false)
    if(s.query.isBlank()&&s.category.isBlank()&&s.model.isBlank()&&s.source.isBlank()&&s.origin.isNotBlank())runCatching{repo.cache(s.origin,page.copy(items=combined))}
   }catch(e:CancellationException){throw e}catch(e:Exception){if(generation==revision)state=state.copy(loadingMore=false,error=message(e))}
  }
 }
 fun connect(value:String){
  if(state.connecting)return
  val origin=try{normalizeOrigin(value,BuildConfig.DEBUG)}catch(e:Exception){state=state.copy(connectionMessage=e.message);return}
  state=state.copy(connecting=true,connectionMessage=null)
  viewModelScope.launch{
   try{
    val page=repo.fetch(origin,"","","");request?.cancel();more?.cancel();revision++;repo.setOrigin(origin)
    state=state.copy(origin=origin,source="",query="",category="",model="",connecting=false,connectionMessage="Sunucu bağlandı. Keşfet ekranı hazır.");apply(page);runCatching{repo.cache(origin,page)}
   }catch(e:CancellationException){throw e}catch(e:Exception){state=state.copy(connecting=false,connectionMessage=message(e))}
  }
 }
 fun collection(){if(state.connecting)return;repo.setOrigin("");state=state.copy(origin="",source="",query="",category="",model="",items=emptyList(),connectionMessage="Hazır koleksiyon etkin.");refresh()}
}
