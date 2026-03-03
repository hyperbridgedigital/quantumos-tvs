'use client';
import { useState, useCallback } from 'react';
import { brand } from '@/lib/brand';
import { useApp } from '@/context/AppContext';

const s = { card:{ background:brand.bg2, border:'1px solid '+brand.border, borderRadius:12, padding:16 }, label:{ fontSize:10, fontWeight:700, letterSpacing:'.08em', color:brand.dim, textTransform:'uppercase', marginBottom:6 }, btn:{ padding:'8px 16px', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer', border:'none' }, input:{ padding:'8px 12px', borderRadius:6, background:brand.bg, color:brand.text, border:'1px solid '+brand.border, fontSize:12, width:'100%' } };

export default function CMSManager() {
  const { cms, setCms } = useApp();
  const [tab, setTab] = useState('hero');
  const [preview, setPreview] = useState(false);
  const [editBanner, setEditBanner] = useState(null);
  const [editBlog, setEditBlog] = useState(null);
  const [newInstaUrl, setNewInstaUrl] = useState('');
  const [newInstaCaption, setNewInstaCaption] = useState('');

  const tabs = [
    { key:'hero', label:'🖼 Hero Banners' },{ key:'menu', label:'🍽 Menu Display' },
    { key:'offers', label:'🎁 Offers Strip' },{ key:'blog', label:'📝 Blog/Stories' },
    { key:'community', label:'💬 Community' },{ key:'text', label:'📄 Text Blocks' },
    { key:'footer', label:'🔗 Footer' },{ key:'announce', label:'📢 Announcement' },
    { key:'instagram', label:'📸 Instagram Embed' },
    { key:'order', label:'📋 Section Order' },
  ];

  const inferInstagramMediaType = (url) => {
    if (!url) return 'image';
    const lower = url.toLowerCase();
    return lower.includes('/reel/') || lower.includes('/tv/') ? 'video' : 'image';
  };

  const addInstagramPost = () => {
    const url = newInstaUrl.trim();
    if (!url) return;
    const mediaType = inferInstagramMediaType(url);
    setCms((p) => ({
      ...p,
      instagramFeed: {
        ...p.instagramFeed,
        posts: [
          ...(p.instagramFeed?.posts || []),
          {
            id: 'IG' + Date.now(),
            url,
            mediaType,
            caption: newInstaCaption.trim() || '',
            active: true,
            order: (p.instagramFeed?.posts?.length || 0) + 1,
          },
        ],
      },
    }));
    setNewInstaUrl('');
    setNewInstaCaption('');
  };

  const updateBanner = (id, field, value) => {
    setCms(p => ({...p, heroBanners: p.heroBanners.map(b => b.id===id ? {...b,[field]:value} : b)}));
  };

  const toggleBanner = (id) => updateBanner(id, 'active', !cms.heroBanners.find(b=>b.id===id)?.active);

  const moveBanner = (id, dir) => {
    setCms(p => {
      const banners = [...p.heroBanners].sort((a,b)=>a.order-b.order);
      const idx = banners.findIndex(b=>b.id===id);
      if ((dir==='up'&&idx===0)||(dir==='down'&&idx===banners.length-1)) return p;
      const swap = dir==='up'?idx-1:idx+1;
      [banners[idx].order, banners[swap].order] = [banners[swap].order, banners[idx].order];
      return {...p, heroBanners: banners};
    });
  };

  const updateBlog = (id, field, value) => {
    setCms(p => ({...p, blogPosts: p.blogPosts.map(b => b.id===id ? {...b,[field]:value} : b)}));
  };

  const moderateUGC = (id, status) => {
    setCms(p => ({...p, communityPosts: p.communityPosts.map(c => c.id===id ? {...c,status} : c)}));
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h2 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:brand.heading, margin:0 }}>📝 Content Management</h2>
          <p style={{ fontSize:12, color:brand.dim, margin:'4px 0 0' }}>Control all storefront content from here</p>
        </div>
        <button onClick={()=>setPreview(!preview)} style={{ ...s.btn, background:preview?brand.emerald:brand.gold+'22', color:preview?'#fff':brand.gold, border:'1px solid '+(preview?brand.emerald:brand.gold+'44') }}>
          {preview?'✅ Preview Mode':'👁 Preview'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{ display:'flex', gap:4, marginBottom:16, overflowX:'auto', paddingBottom:4 }}>
        {tabs.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{ ...s.btn, background:tab===t.key?brand.gold+'22':'rgba(255,255,255,.04)', color:tab===t.key?brand.gold:brand.dim, border:'1px solid '+(tab===t.key?brand.gold+'44':brand.border), whiteSpace:'nowrap', fontSize:10, padding:'6px 12px' }}>{t.label}</button>
        ))}
      </div>

      {/* Hero Banners */}
      {tab==='hero' && <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {cms.heroBanners.sort((a,b)=>a.order-b.order).map(b => (
          <div key={b.id} style={{ ...s.card, opacity:b.active?1:.5, display:'flex', gap:16, alignItems:'center' }}>
            <div style={{ width:120, height:60, borderRadius:8, background:b.gradient||brand.bg3, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:brand.dim, flexShrink:0 }}>Banner {b.order}</div>
            <div style={{ flex:1 }}>
              <input value={b.title} onChange={e=>updateBanner(b.id,'title',e.target.value)} style={{ ...s.input, marginBottom:6, fontWeight:700 }} />
              <input value={b.subtitle} onChange={e=>updateBanner(b.id,'subtitle',e.target.value)} style={{ ...s.input, fontSize:11 }} />
              <div style={{ display:'flex', gap:6, marginTop:6 }}>
                <input value={b.cta} onChange={e=>updateBanner(b.id,'cta',e.target.value)} style={{ ...s.input, width:100 }} placeholder="CTA" />
                <input value={b.ctaLink} onChange={e=>updateBanner(b.id,'ctaLink',e.target.value)} style={{ ...s.input, width:120 }} placeholder="CTA Link" />
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              <button onClick={()=>toggleBanner(b.id)} style={{ ...s.btn, background:b.active?brand.emerald+'22':brand.red+'22', color:b.active?brand.emerald:brand.red, fontSize:10, padding:'4px 10px' }}>{b.active?'Active':'Hidden'}</button>
              <button onClick={()=>moveBanner(b.id,'up')} style={{ ...s.btn, background:'rgba(255,255,255,.04)', color:brand.dim, fontSize:10, padding:'4px 10px' }}>↑</button>
              <button onClick={()=>moveBanner(b.id,'down')} style={{ ...s.btn, background:'rgba(255,255,255,.04)', color:brand.dim, fontSize:10, padding:'4px 10px' }}>↓</button>
            </div>
          </div>
        ))}
      </div>}

      {/* Blog/Stories */}
      {tab==='blog' && <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <button onClick={()=>setCms(p=>({...p,blogPosts:[...p.blogPosts,{id:'BP'+Date.now(),title:'New Post',slug:'new-post',excerpt:'',body:'',tags:[],seoTitle:'',seoDesc:'',author:'Team Mehfil',published:false,publishedAt:'',featured:false}]}))} style={{ ...s.btn, background:brand.gold+'22', color:brand.gold, border:'1px solid '+brand.gold+'44', alignSelf:'flex-start' }}>+ New Post</button>
        {cms.blogPosts.map(p=>(
          <div key={p.id} style={{ ...s.card }}>
            <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:10, padding:'2px 8px', borderRadius:4, background:p.published?brand.emerald+'22':brand.dim+'22', color:p.published?brand.emerald:brand.dim, fontWeight:600 }}>{p.published?'Published':'Draft'}</span>
              {p.featured && <span style={{ fontSize:10, padding:'2px 8px', borderRadius:4, background:brand.gold+'22', color:brand.gold, fontWeight:600 }}>⭐ Featured</span>}
            </div>
            <input value={p.title} onChange={e=>updateBlog(p.id,'title',e.target.value)} style={{ ...s.input, marginBottom:6, fontWeight:700 }} placeholder="Title" />
            <textarea value={p.body} onChange={e=>updateBlog(p.id,'body',e.target.value)} style={{ ...s.input, minHeight:80, resize:'vertical' }} placeholder="Content..." />
            <div style={{ display:'flex', gap:6, marginTop:8 }}>
              <input value={p.seoTitle} onChange={e=>updateBlog(p.id,'seoTitle',e.target.value)} style={{ ...s.input }} placeholder="SEO Title" />
              <input value={p.seoDesc} onChange={e=>updateBlog(p.id,'seoDesc',e.target.value)} style={{ ...s.input }} placeholder="SEO Description" />
            </div>
            <div style={{ display:'flex', gap:6, marginTop:8 }}>
              <button onClick={()=>updateBlog(p.id,'published',!p.published)} style={{ ...s.btn, background:brand.emerald+'22', color:brand.emerald, fontSize:10, padding:'4px 12px' }}>{p.published?'Unpublish':'Publish'}</button>
              <button onClick={()=>updateBlog(p.id,'featured',!p.featured)} style={{ ...s.btn, background:brand.gold+'22', color:brand.gold, fontSize:10, padding:'4px 12px' }}>{p.featured?'Unfeature':'Feature'}</button>
            </div>
          </div>
        ))}
      </div>}

      {/* Community Moderation */}
      {tab==='community' && <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {cms.communityPosts.map(c=>(
          <div key={c.id} style={{ ...s.card, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:13, color:brand.heading, fontWeight:600 }}>{c.author}</div>
              <div style={{ fontSize:12, color:brand.text, marginTop:2 }}>{c.text}</div>
              <div style={{ fontSize:10, color:brand.dim, marginTop:4 }}>{'⭐'.repeat(c.rating)} · {c.date}</div>
            </div>
            <div style={{ display:'flex', gap:4, flexShrink:0 }}>
              <span style={{ fontSize:10, padding:'2px 8px', borderRadius:4, background:(c.status==='approved'?brand.emerald:c.status==='pending'?brand.saffron:brand.red)+'22', color:c.status==='approved'?brand.emerald:c.status==='pending'?brand.saffron:brand.red, fontWeight:600 }}>{c.status}</span>
              {c.status==='pending'&&<><button onClick={()=>moderateUGC(c.id,'approved')} style={{ ...s.btn, background:brand.emerald+'22', color:brand.emerald, fontSize:10, padding:'4px 10px' }}>✓</button><button onClick={()=>moderateUGC(c.id,'rejected')} style={{ ...s.btn, background:brand.red+'22', color:brand.red, fontSize:10, padding:'4px 10px' }}>✗</button></>}
              <button onClick={()=>moderateUGC(c.id,c.featured?'approved':'featured')} style={{ ...s.btn, background:brand.gold+'22', color:brand.gold, fontSize:10, padding:'4px 10px' }}>{c.featured?'Unfeature':'⭐'}</button>
            </div>
          </div>
        ))}
      </div>}

      {/* Text Blocks */}
      {tab==='text' && <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {Object.entries(cms.textBlocks).map(([key, val])=>(
          <div key={key} style={s.card}>
            <div style={s.label}>{key}</div>
            <textarea value={val} onChange={e=>setCms(p=>({...p,textBlocks:{...p.textBlocks,[key]:e.target.value}}))} style={{ ...s.input, minHeight:80, resize:'vertical' }} />
          </div>
        ))}
      </div>}

      {/* Footer Config */}
      {tab==='footer' && <div style={s.card}>
        <div style={s.label}>Footer Links</div>
        {cms.footer.links.map((l,i)=>(
          <div key={i} style={{ display:'flex', gap:8, marginBottom:6 }}>
            <input value={l.label} onChange={e=>{const links=[...cms.footer.links];links[i]={...links[i],label:e.target.value};setCms(p=>({...p,footer:{...p.footer,links}}));}} style={{ ...s.input, width:120 }} />
            <input value={l.url} onChange={e=>{const links=[...cms.footer.links];links[i]={...links[i],url:e.target.value};setCms(p=>({...p,footer:{...p.footer,links}}));}} style={s.input} />
          </div>
        ))}
        <div style={{ marginTop:12 }}>
          <div style={s.label}>Social Links</div>
          {Object.entries(cms.footer.social).map(([k,v])=>(
            <div key={k} style={{ display:'flex', gap:8, marginBottom:6, alignItems:'center' }}>
              <span style={{ width:80, fontSize:11, color:brand.dim }}>{k}:</span>
              <input value={v} onChange={e=>setCms(p=>({...p,footer:{...p.footer,social:{...p.footer.social,[k]:e.target.value}}}))} style={s.input} />
            </div>
          ))}
        </div>
      </div>}

      {/* Announcement Bar */}
      {tab==='announce' && <div style={s.card}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={s.label}>Announcement Bar</div>
          <button onClick={()=>setCms(p=>({...p,announcementBar:{...p.announcementBar,active:!p.announcementBar.active}}))} style={{ ...s.btn, background:cms.announcementBar.active?brand.emerald+'22':brand.red+'22', color:cms.announcementBar.active?brand.emerald:brand.red, fontSize:10, padding:'4px 12px' }}>{cms.announcementBar.active?'Active':'Hidden'}</button>
        </div>
        <input value={cms.announcementBar.text} onChange={e=>setCms(p=>({...p,announcementBar:{...p.announcementBar,text:e.target.value}}))} style={{ ...s.input, marginBottom:8 }} placeholder="Announcement text" />
        <div style={{ display:'flex', gap:8 }}>
          <input value={cms.announcementBar.link} onChange={e=>setCms(p=>({...p,announcementBar:{...p.announcementBar,link:e.target.value}}))} style={s.input} placeholder="Link" />
          <input type="color" value={cms.announcementBar.bgColor} onChange={e=>setCms(p=>({...p,announcementBar:{...p.announcementBar,bgColor:e.target.value}}))} style={{ width:40, height:36, border:'none', cursor:'pointer' }} />
        </div>
        {/* Preview */}
        <div style={{ marginTop:12, padding:'8px 16px', borderRadius:8, background:cms.announcementBar.bgColor, color:cms.announcementBar.textColor, fontSize:12, fontWeight:600, textAlign:'center' }}>{cms.announcementBar.text}</div>
      </div>}

      {/* Menu Display */}
      {tab==='menu' && <div style={s.card}>
        <div style={s.label}>Featured Categories</div>
        <p style={{ fontSize:12, color:brand.text, marginBottom:8 }}>Categories shown prominently: {cms.menuDisplay.featuredCategories.join(', ')}</p>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {['biryani','starters','desserts','beverages','snacks','combos'].map(c=>(
            <button key={c} onClick={()=>setCms(p=>({...p,menuDisplay:{...p.menuDisplay,featuredCategories:p.menuDisplay.featuredCategories.includes(c)?p.menuDisplay.featuredCategories.filter(x=>x!==c):[...p.menuDisplay.featuredCategories,c]}}))} style={{ ...s.btn, background:cms.menuDisplay.featuredCategories.includes(c)?brand.gold+'22':'rgba(255,255,255,.04)', color:cms.menuDisplay.featuredCategories.includes(c)?brand.gold:brand.dim, border:'1px solid '+(cms.menuDisplay.featuredCategories.includes(c)?brand.gold+'44':brand.border), fontSize:10, padding:'4px 12px' }}>{c}</button>
          ))}
        </div>
      </div>}

      {/* Section Order */}
      {tab==='order' && <div style={s.card}>
        <div style={s.label}>Section Display Order (Drag concept)</div>
        {cms.sectionOrder.map((sec,i)=>(
          <div key={sec} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', marginBottom:4, background:brand.bg3, borderRadius:8 }}>
            <span style={{ fontSize:12, color:brand.dim, width:24 }}>{i+1}.</span>
            <span style={{ fontSize:12, color:brand.heading, flex:1 }}>{sec}</span>
            <button onClick={()=>{if(i===0)return;const o=[...cms.sectionOrder];[o[i],o[i-1]]=[o[i-1],o[i]];setCms(p=>({...p,sectionOrder:o}));}} style={{ ...s.btn, background:'rgba(255,255,255,.04)', color:brand.dim, fontSize:10, padding:'2px 8px' }}>↑</button>
            <button onClick={()=>{if(i===cms.sectionOrder.length-1)return;const o=[...cms.sectionOrder];[o[i],o[i+1]]=[o[i+1],o[i]];setCms(p=>({...p,sectionOrder:o}));}} style={{ ...s.btn, background:'rgba(255,255,255,.04)', color:brand.dim, fontSize:10, padding:'2px 8px' }}>↓</button>
          </div>
        ))}
      </div>}

      {tab==='offers' && <div style={s.card}>
        <div style={s.label}>Active Promos in Offers Strip</div>
        <p style={{ fontSize:12, color:brand.text }}>{cms.offersStrip.promos.join(', ')}</p>
        <button onClick={()=>setCms(p=>({...p,offersStrip:{...p.offersStrip,active:!p.offersStrip.active}}))} style={{ ...s.btn, background:cms.offersStrip.active?brand.emerald+'22':brand.red+'22', color:cms.offersStrip.active?brand.emerald:brand.red, fontSize:10, padding:'6px 12px', marginTop:8 }}>{cms.offersStrip.active?'Enabled':'Disabled'}</button>
      </div>}

      {/* Instagram Embed */}
      {tab==='instagram' && <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div style={s.card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div style={s.label}>Homepage Instagram Section</div>
            <button onClick={()=>setCms(p=>({...p,instagramFeed:{...p.instagramFeed,active:!p.instagramFeed?.active}}))} style={{ ...s.btn, background:cms.instagramFeed?.active?brand.emerald+'22':brand.red+'22', color:cms.instagramFeed?.active?brand.emerald:brand.red, fontSize:10, padding:'4px 12px' }}>
              {cms.instagramFeed?.active?'Active':'Hidden'}
            </button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
            <input value={cms.instagramFeed?.title || ''} onChange={e=>setCms(p=>({...p,instagramFeed:{...p.instagramFeed,title:e.target.value}}))} style={s.input} placeholder="Section title" />
            <input value={String(cms.instagramFeed?.maxItems || 8)} onChange={e=>setCms(p=>({...p,instagramFeed:{...p.instagramFeed,maxItems:Number(e.target.value)||8}}))} style={s.input} placeholder="Max items" />
          </div>
          <textarea value={cms.instagramFeed?.subtitle || ''} onChange={e=>setCms(p=>({...p,instagramFeed:{...p.instagramFeed,subtitle:e.target.value}}))} style={{ ...s.input, minHeight:60, resize:'vertical' }} placeholder="Section subtitle" />
        </div>

        <div style={s.card}>
          <div style={s.label}>Add Instagram Post/Reel Embed</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:8 }}>
            <input value={newInstaUrl} onChange={e=>setNewInstaUrl(e.target.value)} style={s.input} placeholder="https://www.instagram.com/p/... or /reel/..." />
            <input value={newInstaCaption} onChange={e=>setNewInstaCaption(e.target.value)} style={s.input} placeholder="Caption (optional)" />
            <button onClick={addInstagramPost} style={{ ...s.btn, background:brand.gold+'22', color:brand.gold, border:'1px solid '+brand.gold+'44' }}>+ Add</button>
          </div>
          <div style={{ marginTop:8, fontSize:10, color:brand.dim }}>
            If multiple videos are active, homepage will render them in a carousel automatically.
          </div>
        </div>

        {(cms.instagramFeed?.posts || []).sort((a,b)=>(a.order||0)-(b.order||0)).map((post, idx) => (
          <div key={post.id} style={s.card}>
            <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:10, padding:'2px 8px', borderRadius:4, background:'rgba(255,255,255,.06)', color:brand.dim }}>#{idx+1}</span>
              <span style={{ fontSize:10, padding:'2px 8px', borderRadius:4, background:(post.mediaType==='video'?brand.blue:brand.gold)+'22', color:post.mediaType==='video'?brand.blue:brand.gold, fontWeight:700 }}>
                {post.mediaType === 'video' ? 'VIDEO/REEL' : 'IMAGE/POST'}
              </span>
              <span style={{ fontSize:10, padding:'2px 8px', borderRadius:4, background:post.active?brand.emerald+'22':brand.red+'22', color:post.active?brand.emerald:brand.red }}>
                {post.active ? 'Active' : 'Hidden'}
              </span>
            </div>
            <input value={post.url} onChange={e=>setCms(p=>({...p,instagramFeed:{...p.instagramFeed,posts:p.instagramFeed.posts.map(x=>x.id===post.id?{...x,url:e.target.value,mediaType:inferInstagramMediaType(e.target.value)}:x)}}))} style={{ ...s.input, marginBottom:6 }} />
            <input value={post.caption || ''} onChange={e=>setCms(p=>({...p,instagramFeed:{...p.instagramFeed,posts:p.instagramFeed.posts.map(x=>x.id===post.id?{...x,caption:e.target.value}:x)}}))} style={s.input} placeholder="Caption" />
            <div style={{ display:'flex', gap:6, marginTop:8 }}>
              <button onClick={()=>setCms(p=>({...p,instagramFeed:{...p.instagramFeed,posts:p.instagramFeed.posts.map(x=>x.id===post.id?{...x,active:!x.active}:x)}}))} style={{ ...s.btn, background:'rgba(255,255,255,.04)', color:brand.dim, fontSize:10, padding:'4px 10px' }}>{post.active?'Hide':'Show'}</button>
              <button onClick={()=>setCms(p=>({...p,instagramFeed:{...p.instagramFeed,posts:p.instagramFeed.posts.filter(x=>x.id!==post.id)}}))} style={{ ...s.btn, background:brand.red+'22', color:brand.red, fontSize:10, padding:'4px 10px' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}
