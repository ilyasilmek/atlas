package com.promptatlas.app.ui
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
private val Dark=darkColorScheme(primary=Color(0xFFC3AEFF),onPrimary=Color(0xFF241347),secondary=Color(0xFFFFC990),background=Color(0xFF0D101A),surface=Color(0xFF151927),surfaceVariant=Color(0xFF222738),onBackground=Color(0xFFF1F0F8),onSurface=Color(0xFFF1F0F8),onSurfaceVariant=Color(0xFFB8BDCD))
private val Light=lightColorScheme(primary=Color(0xFF6541A9),onPrimary=Color.White,secondary=Color(0xFF925523),background=Color(0xFFF8F6FC),surface=Color.White,surfaceVariant=Color(0xFFECE7F5),onBackground=Color(0xFF202030),onSurface=Color(0xFF202030),onSurfaceVariant=Color(0xFF575366))
@Composable fun AtlasTheme(dark:Boolean,content:@Composable ()->Unit){MaterialTheme(colorScheme=if(dark)Dark else Light,content=content)}
