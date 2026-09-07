'use client';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {usePrivy} from '@privy-io/react-auth';
import {Bell, Bookmark, Bot, Heart, Home, Image, LogIn, LogOut, MessageCircle, MoreHorizontal, PenLine, Repeat2, Search, Share2, TrendingDown, UserRound, Users} from 'lucide-react';

const demoPosts = [
  {id:'demo-1',content:'Bought $BTC because the candle was green. It turned red before the order confirmation loaded. Still holding because selling would make it real.',category:'BTC',created_at:new Date().toISOString(),profiles:{display_name:'Chad Bagholder',username:'never_selling',avatar_url:null},likes:[1,2,3,4,5,6,7,8,9,10,11],comments:[1,2,3]},
  {id:'demo-2',content:'My stop loss worked perfectly. It sold the exact bottom and watched the market recover without me.',category:'STUCKERS',created_at:new Date(Date.now()-3600000).toISOString(),profiles:{display_name:'Wendy Exit Liquidity',username:'wendyrekt',avatar_url:null},likes:[1,2,3,4,5,6],comments:[1,2]},
  {id:'demo-3',content:'Diversified my portfolio into five different coins. Somehow they all share the same chart: straight down.',category:'MEME',created_at:new Date(Date.now()-7200000).toISOString(),profiles:{display_name:'Diamond Hands Dave',username:'downonlydave',avatar_url:null},likes:[1,2,3,4],comments:[1]}
];
const trends=[['AI','NVDA','$162.30','−12.8%'],['BONK','BONK','$0.000008','−38.2%'],['MEME','DOGE','$0.14','−21.7%'],['SHROOM','MU','$84.11','−16.3%'],['UBIK','GLD','$301.20','−9.4%']];
const nav=[[Home,'Home'],[Search,'Explore'],[Bell,'Notifications'],[Bookmark,'Bookmarks'],[UserRound,'Profile']];

function initials(name='S'){return name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase()}
function Avatar({profile,size='md'}){return profile?.avatar_url?<img className={`avatar ${size}`} src={profile.avatar_url} alt=""/>:<span className={`avatar fallback ${size}`}>{initials(profile?.display_name)}</span>}

export default function Page(){
  const {ready,authenticated,user,login,logout,getAccessToken}=usePrivy();
  const [posts,setPosts]=useState(demoPosts),[members,setMembers]=useState([]),[text,setText]=useState(''),[category,setCategory]=useState('STUCKERS'),[tab,setTab]=useState('For you'),[busy,setBusy]=useState(false),[toast,setToast]=useState('');
  const twitter=useMemo(()=>user?.twitter || user?.linkedAccounts?.find(a=>a.type==='twitter_oauth'||a.type==='twitter'),[user]);
  const me=useMemo(()=>twitter?{id:user?.id,display_name:twitter.name||twitter.username,username:twitter.username,avatar_url:twitter.profilePictureUrl||twitter.profile_picture_url}:null,[twitter,user]);
  const notice=m=>{setToast(m);setTimeout(()=>setToast(''),2400)};
  const authed=useCallback(async(url,options={})=>{const token=await getAccessToken();return fetch(url,{...options,headers:{'content-type':'application/json',authorization:`Bearer ${token}`,...options.headers}})},[getAccessToken]);
  const refresh=useCallback(async()=>{try{const [f,m]=await Promise.all([fetch('/api/feed'),fetch('/api/members')]);const fd=await f.json(),md=await m.json();if(Array.isArray(fd)&&fd.length)setPosts(fd);if(Array.isArray(md))setMembers(md)}catch{}},[]);
  useEffect(()=>{refresh()},[refresh]);
  useEffect(()=>{if(!authenticated||!me?.username)return;authed('/api/profile',{method:'POST',body:JSON.stringify({twitterId:twitter?.subject||twitter?.id,username:me.username,displayName:me.display_name,avatarUrl:me.avatar_url})}).then(()=>refresh()).catch(()=>notice('Could not sync your X profile.'))},[authenticated,me?.username]);
  const requireLogin=()=>{if(!authenticated){login();return false}return true};
  async function publish(){if(!requireLogin())return;if(!text.trim())return notice('Confess a bad trade first.');setBusy(true);const r=await authed('/api/posts',{method:'POST',body:JSON.stringify({content:text,category})});setBusy(false);if(!r.ok)return notice('Your mistake failed to post.');setText('');await refresh();notice('Your loss is now public.');}
  async function action(kind,postId,followingId){if(!requireLogin())return;let content;if(kind==='comment'){content=window.prompt('Leave your condolences:');if(!content)return}const r=await authed('/api/actions',{method:'POST',body:JSON.stringify({action:kind,postId,followingId,content})});if(r.ok){await refresh();notice(kind==='follow'?'Following fellow bagholder.':'Pain updated.')}}
  return <div className="shell">
    <aside className="leftRail">
      <div className="wordmark"><img src="/stuckers-logo.png"/><span>Stuckers</span></div>
      <nav>{nav.map(([Icon,label],i)=><button className={i===0?'selected':''} key={label} onClick={()=>label==='Profile'&&!authenticated?login():notice(`${label} is ready for the next release.`)}><Icon/><span>{label}</span></button>)}</nav>
      <button className="postBtn" onClick={()=>document.querySelector('#composer')?.focus()}><PenLine/> Post</button>
      <div className="account">
        {authenticated&&me?<><Avatar profile={me}/><div><b>{me.display_name}</b><small>@{me.username}</small></div><button title="Sign out" onClick={logout}><LogOut/></button></>:<button className="sign" onClick={login}><LogIn/> Sign in</button>}
      </div>
    </aside>

    <main>
      <div className="feedTabs"><button className={tab==='For you'?'on':''} onClick={()=>setTab('For you')}>For you</button><button className={tab==='Following'?'on':''} onClick={()=>setTab('Following')}>Following</button></div>
      <div className="chips">{['All','STUCKERS','AI','MEME','CRYPTO'].map(x=><button className={category===x||x==='All'&&category==='STUCKERS'?'active':''} onClick={()=>setCategory(x==='All'?'STUCKERS':x)} key={x}>{x}</button>)}</div>
      <section className="composer">
        <Avatar profile={me||{display_name:'Guest'}}/>
        <div className="composeBody"><textarea id="composer" value={text} onChange={e=>setText(e.target.value)} placeholder={authenticated?'What did you lose money on today?':'Sign in to share your latest financial mistake'} disabled={!authenticated}/>
          <div className="composeFoot"><div><button title="Add image"><Image/></button><button title="Add feeling"><TrendingDown/></button><select value={category} onChange={e=>setCategory(e.target.value)}><option>STUCKERS</option><option>BTC</option><option>AI</option><option>MEME</option><option>CRYPTO</option></select></div><button className="submit" onClick={authenticated?publish:login} disabled={busy||!ready}>{authenticated?(busy?'Posting…':'Post the damage'):'Sign in to post'}</button></div>
        </div>
      </section>
      <div className="pinned"><TrendingDown/> PINNED LOSSES</div>
      {posts.map(p=><article className="post" key={p.id}><Avatar profile={p.profiles}/><div className="postBody"><header><b>{p.profiles?.display_name}</b><span>@{p.profiles?.username} · {new Date(p.created_at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</span><MoreHorizontal/></header><p>{p.content}</p><div className="lossCard"><div><b>${p.category}</b><span>CERTIFIED BAD IDEA</span></div><strong>−{(12+(String(p.id).length*3)%43)}.4%</strong><svg viewBox="0 0 500 70" preserveAspectRatio="none"><polyline points="0,8 55,18 105,14 160,35 220,28 270,48 325,42 380,59 440,51 500,68"/></svg></div><footer><button onClick={()=>action('comment',p.id)}><MessageCircle/>{p.comments?.length||0}</button><button><Repeat2/></button><button onClick={()=>action('like',p.id)}><Heart/>{p.likes?.length||0}</button><button onClick={()=>action('bookmark',p.id)}><Bookmark/></button><button><Share2/></button></footer></div></article>)}
    </main>

    <aside className="rightRail">
      <label className="search"><Search/><input placeholder="Search Stuckers"/></label>
      <section className="panel"><h2>Trending <span>● LIVE</span></h2>{trends.map((t,i)=><div className="trend" key={t[0]}><i>{t[0][0]}</i><div><b>{t[0]}</b><small>{t[1]}</small></div><div><b>{t[2]}</b><small>{t[3]}</small></div></div>)}<button className="more">Explore everything falling →</button></section>
      <section className="panel"><h2>New Stuckers</h2>{members.length?members.slice(0,4).map(m=><div className="member" key={m.id}><Avatar profile={m}/><div><b>{m.display_name}</b><small>@{m.username}</small></div>{m.id!==user?.id&&<button onClick={()=>action('follow',null,m.id)}>Follow</button>}</div>):<div className="emptyMembers"><Users/><p>Real members will appear here after signing in with X.</p></div>}</section>
      <p className="legal">Entertainment only. No financial advice. The losses are emotionally real, financially fictional.</p>
    </aside>
    {toast&&<div className="toast">{toast}</div>}
  </div>
}
