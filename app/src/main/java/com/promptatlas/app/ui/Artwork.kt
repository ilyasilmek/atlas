package com.promptatlas.app.ui
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.BrokenImage
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.geometry.*
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.*
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.promptatlas.core.Prompt

/** Procedural UI sample artwork, not AI-generated imagery. */
@Composable fun DemoArtwork(index:Int,modifier:Modifier){Canvas(modifier){
 val w=size.width;val h=size.height;val navy=Color(0xFF18243C);val lavender=Color(0xFFC3AEFF);val coral=Color(0xFFE89078);val gold=Color(0xFFFFD396)
 drawRect(when(index%6){2->Color(0xFFF1E8D7);3->Color(0xFFECC8AA);else->navy})
 when(index%6){
  0->{
   drawCircle(Brush.radialGradient(listOf(Color(0xFFE9DCFF),lavender,Color(0xFF7356B3)),Offset(w*.42f,h*.35f),w*.36f),w*.29f,Offset(w*.5f,h*.4f))
   rotate(-24f,Offset(w*.5f,h*.4f)){drawOval(gold,Offset(w*.06f,h*.32f),Size(w*.88f,h*.16f),style=Stroke(w*.008f));drawOval(lavender.copy(alpha=.45f),Offset(w*.02f,h*.29f),Size(w*.96f,h*.22f),style=Stroke(w*.004f))}
   repeat(22){n->drawCircle(gold.copy(alpha=.7f),if(n%3==0)2.5f else 1.5f,Offset(w*((n*37%97)/100f),h*((n*23%89)/100f)))}
   drawCircle(Color(0xFF303A5C),w*.85f,Offset(w*.85f,h*1.29f));drawCircle(Color(0xFF232D49),w*.8f,Offset(w*.12f,h*1.35f))
  }
  1->{drawCircle(gold,w*.22f,Offset(w*.65f,h*.28f));listOf(Color(0xFFCD8A76),Color(0xFFA85F65),Color(0xFF754B64),Color(0xFF422F4C)).forEachIndexed{i,c->
   val y=h*(.37f+i*.13f);val p=Path().apply{moveTo(-w*.1f,h);lineTo(-w*.1f,y+h*.23f);lineTo(w*(.17f+i*.18f),y);lineTo(w*.65f,y+h*.25f);lineTo(w*.9f,y+h*.1f);lineTo(w*1.1f,y+h*.3f);lineTo(w*1.1f,h);close()};drawPath(p,c)
  }}
  2->{repeat(8){n->rotate(n*45f,Offset(w*.5f,h*.5f)){drawOval(if(n%2==0)coral else lavender,Offset(w*.38f,h*.19f),Size(w*.24f,h*.34f))}}
   drawCircle(gold,w*.12f,Offset(w*.5f,h*.5f));drawCircle(navy,w*.045f,Offset(w*.5f,h*.5f));drawLine(navy,Offset(w*.5f,h*.65f),Offset(w*.5f,h*.96f),w*.017f)
   rotate(-35f,Offset(w*.5f,h*.8f)){drawOval(Color(0xFF648D77),Offset(w*.25f,h*.76f),Size(w*.28f,h*.08f))}
  }
  3->{listOf(Color(0xFFD6A080),Color(0xFFB37B78),Color(0xFF845D73),Color(0xFF453D5E)).forEachIndexed{i,c->
   val left=w*(.1f+i*.09f);val top=h*(.16f+i*.085f);val width=w-2*left;drawRoundRect(c,Offset(left,top),Size(width,h),CornerRadius(width/2,width/2))
  };drawPath(Path().apply{moveTo(w*.48f,h*.72f);lineTo(w*.96f,h);lineTo(w*.15f,h);close()},Color(0xFFEDC1A3));drawCircle(gold,w*.08f,Offset(w*.8f,h*.12f))}
  4->{drawCircle(coral,w*.22f,Offset(w*.55f,h*.3f));listOf(Color(0xFF7BBBC0),Color(0xFF3B8C9A),Color(0xFF246276),Color(0xFF173C57)).forEachIndexed{i,c->
   val y=h*(.42f+i*.14f);drawPath(Path().apply{moveTo(0f,y);cubicTo(w*.36f,y+h*.27f,w*.5f,y-h*.24f,w,y);lineTo(w,h);lineTo(0f,h);close()},c)
  }}
  else->{drawCircle(gold,w*.26f,Offset(w*.68f,h*.37f));drawRect(Color(0xFF826AAE),Offset(w*.24f,h*.6f),Size(w*.4f,h*.4f));drawOval(lavender,Offset(w*.24f,h*.56f),Size(w*.4f,h*.09f));drawCircle(Brush.radialGradient(listOf(Color(0xFFFFC5A0),coral,Color(0xFFA65967)),Offset(w*.35f,h*.4f),w*.34f),w*.2f,Offset(w*.44f,h*.4f));drawLine(gold,Offset(w*.13f,h*.87f),Offset(w*.87f,h*.87f),2f)}
 }
}}
@Composable fun PromptImage(p:Prompt,modifier:Modifier,imageIndex:Int=0,scale:ContentScale=ContentScale.Crop){
 p.demoArtwork?.let{DemoArtwork(it,modifier);return}
 val preview=p.previewImage.takeIf{it.isNotBlank()&&imageIndex==0}
 val original=p.images.getOrNull(imageIndex)
 var failed by remember(p.id,imageIndex){mutableStateOf(false)}
 Box(modifier.background(MaterialTheme.colorScheme.surfaceVariant),contentAlignment=Alignment.Center){
  if(preview!=null)AsyncImage(model=preview,contentDescription=p.title,modifier=Modifier.fillMaxSize(),contentScale=scale)
  if(original!=null&&(preview==null||scale==ContentScale.Fit))AsyncImage(model=original,contentDescription=p.title,modifier=Modifier.fillMaxSize(),contentScale=scale,onError={failed=true},onSuccess={failed=false})
  if(preview==null&&(original==null||failed))Icon(Icons.Outlined.BrokenImage,"Görsel yüklenemedi",Modifier.padding(24.dp),tint=MaterialTheme.colorScheme.onSurfaceVariant)
 }
}
