@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)
package com.promptatlas.app.ui
import android.content.*
import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.staggeredgrid.*
import androidx.compose.foundation.pager.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.*
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.*
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.*
import androidx.lifecycle.viewmodel.compose.viewModel
import com.promptatlas.app.BuildConfig
import com.promptatlas.core.*

fun categoryLabel(key:String)=when(key){
 "artStyles","illustration"->"Sanat & stil";"portraitPhoto","portrait","realism"->"Portre & fotoğraf";"designUi","architecture"->"Tasarım";"gameFantasy","game","scifi"->"Oyun & fantastik";"scenes","landscape","animal","cinematic"->"Manzara";"productCommercial"->"Ürün & reklam";"styleEra","abstract"->"Dönem & estetik";else->key
}
@Composable fun AtlasApp(vm:AtlasViewModel=viewModel()){
 val s=vm.state;val activity=androidx.activity.compose.LocalActivity.current
 SideEffect{activity?.let{androidx.core.view.WindowCompat.getInsetsController(it.window,it.window.decorView).apply{isAppearanceLightStatusBars=!s.dark;isAppearanceLightNavigationBars=!s.dark}}}
 var tab by rememberSaveable{mutableIntStateOf(0)}
 var selected by rememberSaveable{mutableStateOf<String?>(null)}
 val detail=remember(selected){selected?.let{runCatching{Codec.decode(it).items.first()}.getOrNull()}}
 AtlasTheme(s.dark){
  BackHandler(enabled=detail!=null){selected=null}
  Scaffold(containerColor=MaterialTheme.colorScheme.background,topBar={
   if(detail!=null)TopAppBar(title={Text("Prompt detayı",fontWeight=FontWeight.SemiBold)},navigationIcon={IconButton(onClick={selected=null}){Icon(Icons.AutoMirrored.Filled.ArrowBack,"Geri")}})
   else TopAppBar(title={Row(verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(10.dp)){
    Box(Modifier.size(36.dp).clip(RoundedCornerShape(12.dp)).background(MaterialTheme.colorScheme.primary),contentAlignment=Alignment.Center){Icon(Icons.Default.AutoAwesome,null,tint=MaterialTheme.colorScheme.onPrimary,modifier=Modifier.size(20.dp))}
    Text("prompt atlas",fontWeight=FontWeight.Bold,letterSpacing=(-.6).sp,fontSize=22.sp)
   }},actions={if(tab==0)IconButton(onClick={vm.refresh()},enabled=!s.loading){Icon(Icons.Default.Refresh,"Yenile")}},colors=TopAppBarDefaults.topAppBarColors(containerColor=MaterialTheme.colorScheme.background))
  },bottomBar={if(detail==null)NavigationBar(containerColor=MaterialTheme.colorScheme.surface,tonalElevation=0.dp){
   listOf("Keşfet","Favoriler","Ayarlar").forEachIndexed{i,label->NavigationBarItem(selected=tab==i,onClick={tab=i},label={Text(label)},icon={Icon(when(i){0->Icons.Outlined.Explore;1->Icons.Outlined.FavoriteBorder;else->Icons.Outlined.Settings},null)})}
  }}){padding->Box(Modifier.padding(padding).fillMaxSize()){
   val open:(Prompt)->Unit={selected=Codec.encode(CatalogPage(items=listOf(it)))}
   if(detail!=null)DetailScreen(detail,vm.saved(detail),{vm.favorite(detail)}) else when(tab){0->DiscoverScreen(s,vm,open){tab=2};1->FavoritesScreen(s,vm,open){tab=0};else->SettingsScreen(s,vm)}
  }}
 }
}
@Composable private fun DiscoverScreen(s:AtlasState,vm:AtlasViewModel,open:(Prompt)->Unit,settings:()->Unit){
 val grid=rememberLazyStaggeredGridState()
 LaunchedEffect(s.query,s.category,s.model,s.origin,s.source){grid.scrollToItem(0)}
 LazyVerticalStaggeredGrid(columns=StaggeredGridCells.Adaptive(156.dp),state=grid,contentPadding=PaddingValues(start=16.dp,end=16.dp,bottom=24.dp),horizontalArrangement=Arrangement.spacedBy(12.dp),verticalItemSpacing=12.dp){
  item(span=StaggeredGridItemSpan.FullLine){Column(verticalArrangement=Arrangement.spacedBy(14.dp)){
   Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(26.dp)).background(Brush.linearGradient(listOf(Color(0xFF36265B),Color(0xFF202C4B))))){
    Column(Modifier.padding(22.dp)){Text("GÖRSEL PROMPT KÜTÜPHANESİ",color=Color(0xFFCFB9FF),fontSize=10.sp,letterSpacing=2.sp,fontWeight=FontWeight.Bold);Spacer(Modifier.height(12.dp));Text("Fikrini bul.\nGörsele dönüştür.",color=Color.White,fontWeight=FontWeight.Bold,fontSize=30.sp,lineHeight=35.sp,letterSpacing=(-1).sp);Spacer(Modifier.height(12.dp));Text("Keşfet · Kopyala · Kendi tarzını kat",color=Color(0xFFD8D3E7),fontSize=12.sp)}
    Icon(Icons.Default.AutoAwesome,null,tint=Color(0xFFF6C58C),modifier=Modifier.align(Alignment.TopEnd).padding(20.dp).size(23.dp))
   }
   if(s.origin.isBlank())Surface(shape=RoundedCornerShape(14.dp),color=MaterialTheme.colorScheme.surfaceVariant){Column(Modifier.padding(12.dp)){
    Text("Gerçek görseller · Açık koleksiyonlar",fontWeight=FontWeight.Bold,color=MaterialTheme.colorScheme.primary)
    Text("Farklı kaynaklardan görseller ve orijinal promptlar. Kaynağa göre keşfet.",style=MaterialTheme.typography.bodySmall)
    TextButton(onClick=settings,contentPadding=PaddingValues(0.dp)){Text("Kaynaklar ve içerik ayarları",fontSize=12.sp)}
   }}
   SearchBox(s.query,vm::query,"Bir fikir, stil veya prompt ara")
   if(s.sources.size>1)Row(Modifier.horizontalScroll(rememberScrollState()),horizontalArrangement=Arrangement.spacedBy(8.dp)){
    FilterChip(selected=s.source.isBlank(),onClick={vm.source("")},label={Text("Tüm kaynaklar")})
    s.sources.forEach{source->FilterChip(selected=s.source==source.id,onClick={vm.source(source.id)},label={Text("${source.name} · ${source.count}")})}
   }
   Row(Modifier.horizontalScroll(rememberScrollState()),horizontalArrangement=Arrangement.spacedBy(8.dp)){
    FilterChip(selected=s.category.isBlank(),onClick={vm.category("")},label={Text("Tümü")})
    s.categories.forEach{c->FilterChip(selected=s.category==c,onClick={vm.category(c)},label={Text(categoryLabel(c))})}
   }
   Row(Modifier.fillMaxWidth(),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.SpaceBetween){
    Column{Text("İlham galerisi",fontSize=21.sp,fontWeight=FontWeight.Bold);Text(if(s.offline)"Çevrimdışı koleksiyon" else "${s.total} prompt",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant)}
    ModelMenu(s.model,s.models,vm::model)
   }
   if(s.loading)LinearProgressIndicator(Modifier.fillMaxWidth())
   s.error?.let{ErrorBanner(it){if(s.items.isNotEmpty()&&s.nextCursor!=null)vm.loadMore() else vm.refresh()}}
  }}
  if(s.items.isEmpty()&&!s.loading&&s.error==null)item(span=StaggeredGridItemSpan.FullLine){EmptyState("Henüz içerik yok","Aramanızı veya filtrelerinizi değiştirin. Yayımlanan promptlar burada görünecek.","Filtreleri temizle",vm::clear)}
  items(s.items,key={it.id}){p->PromptCard(p,vm.saved(p),{vm.favorite(p)},{open(p)})}
  if(s.nextCursor!=null)item(span=StaggeredGridItemSpan.FullLine){OutlinedButton(onClick=vm::loadMore,enabled=!s.loadingMore&&!s.loading,modifier=Modifier.fillMaxWidth()){if(s.loadingMore)CircularProgressIndicator(Modifier.size(18.dp),strokeWidth=2.dp)else Text("Daha fazla keşfet")}}
 }
}
@Composable private fun SearchBox(value:String,change:(String)->Unit,hint:String){OutlinedTextField(value=value,onValueChange=change,modifier=Modifier.fillMaxWidth(),singleLine=true,placeholder={Text(hint,fontSize=13.sp)},leadingIcon={Icon(Icons.Default.Search,null)},shape=RoundedCornerShape(18.dp),trailingIcon={if(value.isNotEmpty())IconButton(onClick={change("")}){Icon(Icons.Default.Close,"Aramayı temizle")}})}
@Composable private fun ModelMenu(selected:String,models:List<String>,change:(String)->Unit){var expanded by remember{mutableStateOf(false)};Box{
 TextButton(onClick={expanded=true}){Icon(Icons.Default.Tune,null,Modifier.size(16.dp));Spacer(Modifier.width(4.dp));Text(selected.ifBlank{"Model"},maxLines=1,overflow=TextOverflow.Ellipsis,modifier=Modifier.widthIn(max=100.dp))}
 DropdownMenu(expanded=expanded,onDismissRequest={expanded=false}){DropdownMenuItem(text={Text("Tüm modeller")},onClick={change("");expanded=false});models.forEach{m->DropdownMenuItem(text={Text(m)},onClick={change(m);expanded=false})}}
}}
@Composable private fun PromptCard(p:Prompt,saved:Boolean,favorite:()->Unit,open:()->Unit){val context=LocalContext.current
 Card(onClick=open,shape=RoundedCornerShape(20.dp),colors=CardDefaults.cardColors(containerColor=MaterialTheme.colorScheme.surface)){
  Box{
   PromptImage(p,Modifier.fillMaxWidth().aspectRatio(if(p.id.hashCode()%2==0).78f else .95f))
   FilledIconButton(onClick=favorite,modifier=Modifier.align(Alignment.TopEnd).padding(5.dp).size(42.dp),colors=IconButtonDefaults.filledIconButtonColors(containerColor=Color(0xAA182039),contentColor=Color.White)){Icon(if(saved)Icons.Default.Favorite else Icons.Default.FavoriteBorder,if(saved)"Favorilerden çıkar" else "Favorilere ekle",Modifier.size(19.dp),tint=if(saved)Color(0xFFFFB8C0)else Color.White)}
   if(p.demoArtwork!=null)Surface(Modifier.align(Alignment.BottomStart).padding(8.dp),color=Color(0xBB182039),shape=RoundedCornerShape(6.dp)){Text("DEMO",Modifier.padding(horizontal=6.dp,vertical=3.dp),color=Color.White,fontSize=9.sp,letterSpacing=1.sp)}
  }
  Column(Modifier.padding(12.dp),verticalArrangement=Arrangement.spacedBy(6.dp)){
   if(p.sourceName.isNotBlank())Text(p.sourceName,fontSize=10.sp,color=MaterialTheme.colorScheme.onSurfaceVariant,maxLines=1)
   Text(p.model.ifBlank{"Prompt"},fontSize=10.sp,fontWeight=FontWeight.Medium,color=MaterialTheme.colorScheme.primary,maxLines=1,overflow=TextOverflow.Ellipsis)
   Text(p.title,fontSize=15.sp,fontWeight=FontWeight.SemiBold,maxLines=2,overflow=TextOverflow.Ellipsis,lineHeight=20.sp)
   TextButton(onClick={copyPrompt(context,p.prompt)},modifier=Modifier.fillMaxWidth().heightIn(min=40.dp),contentPadding=PaddingValues(0.dp)){Icon(Icons.Default.ContentCopy,null,Modifier.size(14.dp));Spacer(Modifier.width(6.dp));Text("Promptu kopyala",fontSize=11.sp)}
  }
 }
}
@Composable private fun FavoritesScreen(s:AtlasState,vm:AtlasViewModel,open:(Prompt)->Unit,explore:()->Unit){
 var q by rememberSaveable{mutableStateOf("")};val saved=s.favorites.filter{it.origin==s.origin}.map{it.item};val filtered=filterPrompts(saved,q)
 LazyVerticalStaggeredGrid(columns=StaggeredGridCells.Adaptive(156.dp),contentPadding=PaddingValues(16.dp),horizontalArrangement=Arrangement.spacedBy(12.dp),verticalItemSpacing=12.dp){
  item(span=StaggeredGridItemSpan.FullLine){Column(verticalArrangement=Arrangement.spacedBy(14.dp)){Text("Sana ilham verenler",fontSize=27.sp,fontWeight=FontWeight.Bold);Text("${saved.size} kayıt · Bu telefonda saklanıyor",color=MaterialTheme.colorScheme.onSurfaceVariant);SearchBox(q,{q=it},"Favorilerinde ara")}}
  if(filtered.isEmpty())item(span=StaggeredGridItemSpan.FullLine){EmptyState(if(saved.isEmpty())"Koleksiyonun burada başlıyor" else "Eşleşen favori yok","Beğendiğin görsellerdeki kalbe dokun; promptları sonra yeniden bul.","Galeriye git",explore)}
  items(filtered,key={it.id}){p->PromptCard(p,true,{vm.favorite(p)},{open(p)})}
 }
}
@Composable private fun DetailScreen(p:Prompt,saved:Boolean,favorite:()->Unit){
 val context=LocalContext.current;var copied by remember(p.id){mutableStateOf(false)}
 LaunchedEffect(copied){if(copied){kotlinx.coroutines.delay(1800);copied=false}}
 LazyColumn(contentPadding=PaddingValues(start=18.dp,end=18.dp,bottom=28.dp),verticalArrangement=Arrangement.spacedBy(18.dp)){
  item{val count=p.images.size.coerceAtLeast(1);val pager=rememberPagerState(pageCount={count});Column{
   HorizontalPager(state=pager,modifier=Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp))){i->PromptImage(p,Modifier.fillMaxWidth().aspectRatio(.9f),i,ContentScale.Fit)}
   if(count>1)Text("${pager.currentPage+1} / $count · Diğer görseller için kaydır",Modifier.padding(top=8.dp),style=MaterialTheme.typography.bodySmall)
  }}
  item{Column(verticalArrangement=Arrangement.spacedBy(10.dp)){
   Text(p.model,color=MaterialTheme.colorScheme.primary,fontWeight=FontWeight.SemiBold);Text(p.title,fontSize=28.sp,lineHeight=32.sp,fontWeight=FontWeight.Bold)
   if(p.sourceName.isNotBlank())Text("Kaynak: ${p.sourceName}",color=MaterialTheme.colorScheme.primary,style=MaterialTheme.typography.bodySmall)
   if(p.requiresReference)Text("Bu prompt bir referans fotoğraf veya görsel gerektirebilir. AI aracınıza kendi referansınızı ekleyin.",color=MaterialTheme.colorScheme.secondary,style=MaterialTheme.typography.bodySmall)
   if(p.description.isNotBlank())Text(p.description,color=MaterialTheme.colorScheme.onSurfaceVariant)
   if(p.demoArtwork!=null)Text("DEMO İLLÜSTRASYON · Görsel kodla çizilmiştir. Prompt, benzer kompozisyon denemek için hazırlanmış bir örnektir.",color=MaterialTheme.colorScheme.secondary,style=MaterialTheme.typography.bodySmall)
   if(p.tags.isNotEmpty())Row(Modifier.horizontalScroll(rememberScrollState()),horizontalArrangement=Arrangement.spacedBy(6.dp)){p.tags.forEach{tag->SuggestionChip(onClick={},label={Text("#$tag",fontSize=11.sp)})}}
  }}
  item{Surface(shape=RoundedCornerShape(20.dp),color=MaterialTheme.colorScheme.surfaceVariant){Column(Modifier.padding(18.dp),verticalArrangement=Arrangement.spacedBy(14.dp)){
   Row(Modifier.fillMaxWidth(),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.SpaceBetween){Text("PROMPT",fontSize=11.sp,fontWeight=FontWeight.Bold,letterSpacing=2.sp);IconButton(onClick={copyPrompt(context,p.prompt);copied=true}){Icon(if(copied)Icons.Default.Check else Icons.Default.ContentCopy,"Promptu kopyala")}}
   SelectionContainer{Text(p.prompt,lineHeight=25.sp,fontSize=15.sp)}
  }}}
  item{Column(verticalArrangement=Arrangement.spacedBy(10.dp)){
   Button(onClick={copyPrompt(context,p.prompt);copied=true},modifier=Modifier.fillMaxWidth().heightIn(min=54.dp),shape=RoundedCornerShape(16.dp)){Icon(if(copied)Icons.Default.Check else Icons.Default.ContentCopy,null,Modifier.size(19.dp));Spacer(Modifier.width(10.dp));Text(if(copied)"Kopyalandı" else "Promptu kopyala")}
   Row(horizontalArrangement=Arrangement.spacedBy(10.dp)){
    OutlinedButton(onClick=favorite,modifier=Modifier.weight(1f)){Icon(if(saved)Icons.Default.Favorite else Icons.Default.FavoriteBorder,null,Modifier.size(18.dp));Spacer(Modifier.width(6.dp));Text(if(saved)"Kaydedildi" else "Kaydet")}
    OutlinedButton(onClick={sharePrompt(context,p)},modifier=Modifier.weight(1f)){Icon(Icons.Default.Share,null,Modifier.size(18.dp));Spacer(Modifier.width(6.dp));Text("Paylaş")}
   }
   Text("Promptu kullandığın yapay zekâ aracına yapıştır. Aynı model ve ayarlar benzer sonuçlar için yardımcı olur; sonuçlar değişebilir.",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant)
  }}
  if(p.license.isNotBlank())item{Column(verticalArrangement=Arrangement.spacedBy(6.dp)){
   Text("Kaynak ve kullanım bilgisi",fontWeight=FontWeight.Bold)
   Text(p.attribution,style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant)
   TextButton(onClick={openExternal(context,p.licenseUrl)}){Text(p.license)}
   if(p.catalogUrl.isNotBlank())TextButton(onClick={openExternal(context,p.catalogUrl)}){Text("Koleksiyonun kaynak kodu")}
   p.images.firstOrNull()?.let{url->TextButton(onClick={openExternal(context,url)}){Text("Orijinal görseli aç")}}
  }}
  if(!p.authorHandle.isNullOrBlank()||!p.sourceUrl.isNullOrBlank())item{Column{p.authorHandle?.let{Text("Paylaşan: $it",style=MaterialTheme.typography.bodySmall)};p.sourceUrl?.let{url->TextButton(onClick={openExternal(context,url)}){Text("Orijinal kaynağı aç")}}}}
 }
}
@Composable private fun SettingsScreen(s:AtlasState,vm:AtlasViewModel){
 var origin by rememberSaveable(s.origin){mutableStateOf(s.origin)};val context=LocalContext.current
 LazyColumn(contentPadding=PaddingValues(20.dp),verticalArrangement=Arrangement.spacedBy(20.dp)){
  item{Text("Atlas'ını kişiselleştir",fontSize=27.sp,fontWeight=FontWeight.Bold)}
  item{Surface(shape=RoundedCornerShape(20.dp),color=MaterialTheme.colorScheme.surface){Row(Modifier.fillMaxWidth().padding(18.dp),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.SpaceBetween){Column{Text("Koyu görünüm",fontWeight=FontWeight.SemiBold);Text("Açık ve koyu tema",style=MaterialTheme.typography.bodySmall)};Switch(checked=s.dark,onCheckedChange=vm::dark)}}}
  item{Surface(shape=RoundedCornerShape(20.dp),color=MaterialTheme.colorScheme.surface){Column(Modifier.padding(18.dp),verticalArrangement=Arrangement.spacedBy(14.dp)){
   Text("İçerik sunucusu",fontSize=19.sp,fontWeight=FontWeight.Bold)
   Text(if(s.origin.isBlank())"Hazır çok kaynaklı koleksiyon açık." else "Bağlı: ${s.origin}",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.primary)
   Text("Hazır koleksiyon sunucu gerektirmez. İsterseniz kendi Open Prompts sunucunuza geçerek özel kataloğunuzu görüntüleyebilirsiniz.")
   OutlinedTextField(value=origin,onValueChange={origin=it},label={Text("Sunucu adresi")},placeholder={Text("https://prompts.siteniz.com")},singleLine=true,modifier=Modifier.fillMaxWidth(),shape=RoundedCornerShape(14.dp),enabled=!s.connecting)
   Button(onClick={vm.connect(origin)},enabled=!s.connecting&&origin.isNotBlank(),modifier=Modifier.fillMaxWidth()){if(s.connecting)CircularProgressIndicator(Modifier.size(18.dp),strokeWidth=2.dp)else Text("Bağlantıyı doğrula ve kaydet")}
   s.connectionMessage?.let{Text(it,style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.primary)}
   if(s.origin.isNotBlank())TextButton(onClick=vm::collection,enabled=!s.connecting){Text("Hazır koleksiyonu aç")}
  }}}
  item{Column(verticalArrangement=Arrangement.spacedBy(10.dp)){
   Text("Koleksiyon kaynakları",fontWeight=FontWeight.Bold)
   Text("Open Prompts · GPT Image 2 Hub · Awesome GPT-4o\nGerçek görsellerin küçük önizlemeleri ve promptları uygulamayla birlikte gelir. Yeni koleksiyonlar katalog içe aktarma aracıyla eklenir. Yenile düğmesi, bağlı bir sunucu varsa oradaki güncellemeleri alır.",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant)
   Text("Verilerin",fontWeight=FontWeight.Bold)
   Text("Favoriler ve tema bu telefonda saklanır. Analitik veya reklam SDK'sı yoktur. Canlı bağlantıda aramalar sunucunuza, görsel istekleri görsellerin barındırıldığı hizmetlere gönderilir.",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant)
   Text("Uygulama bilgisi",fontWeight=FontWeight.Bold)
   Text("Prompt Atlas ${BuildConfig.VERSION_NAME}\nBirden fazla açık koleksiyonu birleştiren Android prompt galerisi.\nKod: Apache 2.0. İçerikler kaynaklarına aittir.",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant)
   TextButton(onClick={openExternal(context,"https://github.com/rudy2steiner/open-prompts")}){Text("Open Prompts kaynak kodu")}
  }}
 }
}
@Composable private fun EmptyState(title:String,body:String,action:String,click:()->Unit){Column(Modifier.fillMaxWidth().padding(vertical=35.dp,horizontal=16.dp),horizontalAlignment=Alignment.CenterHorizontally,verticalArrangement=Arrangement.spacedBy(12.dp)){Icon(Icons.Outlined.CollectionsBookmark,null,Modifier.size(42.dp),tint=MaterialTheme.colorScheme.primary);Text(title,fontWeight=FontWeight.SemiBold,fontSize=19.sp);Text(body,color=MaterialTheme.colorScheme.onSurfaceVariant);TextButton(onClick=click){Text(action)}}}
@Composable private fun ErrorBanner(message:String,retry:()->Unit){Surface(shape=RoundedCornerShape(14.dp),color=MaterialTheme.colorScheme.errorContainer){Column(Modifier.padding(14.dp)){Text(message,color=MaterialTheme.colorScheme.onErrorContainer,style=MaterialTheme.typography.bodySmall);TextButton(onClick=retry){Text("Yeniden dene",color=MaterialTheme.colorScheme.onErrorContainer)}}}}
private fun copyPrompt(context:Context,text:String){(context.getSystemService(Context.CLIPBOARD_SERVICE)as ClipboardManager).setPrimaryClip(ClipData.newPlainText("Prompt",text));Toast.makeText(context,"Prompt kopyalandı",Toast.LENGTH_SHORT).show()}
private fun sharePrompt(context:Context,p:Prompt){val text=buildString{append(p.title);append("\n\n");append(p.prompt);if(p.model.isNotBlank())append("\n\nModel: ${p.model}");p.sourceUrl?.let{append("\nKaynak: $it")};if(p.sourceName.isNotBlank())append("\nKoleksiyon: ${p.sourceName}");if(p.license.isNotBlank())append("\n${p.license}: ${p.licenseUrl}");p.authorHandle?.let{append("\nPrompt yazarı: $it")}};val intent=Intent(Intent.ACTION_SEND).apply{type="text/plain";putExtra(Intent.EXTRA_TEXT,text)};runCatching{context.startActivity(Intent.createChooser(intent,"Promptu paylaş"))}.onFailure{Toast.makeText(context,"Paylaşım uygulaması bulunamadı.",Toast.LENGTH_SHORT).show()}}
private fun openExternal(context:Context,url:String){val uri=Uri.parse(url);if(uri.scheme !in listOf("https","http"))return;runCatching{context.startActivity(Intent(Intent.ACTION_VIEW,uri))}.onFailure{Toast.makeText(context,"Bağlantı açılamadı.",Toast.LENGTH_SHORT).show()}}
