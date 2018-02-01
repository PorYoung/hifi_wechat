import ejs from 'ejs'

const template =
`<xml>
<ToUserName><![CDATA[<%= content.toUser %>]]></ToUserName>
<FromUserName><![CDATA[<%= content.fromUser %>]]></FromUserName>
<CreateTime><%= content.createTime %></CreateTime>
<% if(content.MsgType === 'text'){ %>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[<%= content.content %>]]></Content>
<% }else if(content.MsgType === 'image'){ %>
<MsgType><![CDATA[image]]></MsgType>
<Image>
<MediaId><![CDATA[<%= content.media_id %>]]></MediaId>
</Image>
<% }else if(content.MsgType === 'video'){ %>
<MsgType><![CDATA[video]]></MsgType>
<Video>
<MediaId><![CDATA[<%= content.media_id %>]]></MediaId>
<Title><![CDATA[<%= content.title %>]]></Title>
<Description><![CDATA[<%= content.description %>]]></Description>
</Video>
<% }else if(content.MsgType === 'music'){ %>
<MsgType><![CDATA[music]]></MsgType>
<Music>
<Title><![CDATA[<%= content.TITLE %>]]></Title>
<Description><![CDATA[<%= content.DESCRIPTION %>]]></Description>
<MusicUrl><![CDATA[<%= content.MUSIC_Url %>]]></MusicUrl>
<HQMusicUrl><![CDATA[<%= content.HQ_MUSIC_Url %>]]></HQMusicUrl>
<ThumbMediaId><![CDATA[<%= content.media_id %>]]></ThumbMediaId>
</Music>
<% }else if(content.MsgType === 'news'){ %>
    <MsgType><![CDATA[news]]></MsgType>
    <ArticleCount><%= content.news.length %></ArticleCount>
    <Articles>
    <% content.news.forEach(function(item){ %>
        <item>
        <Title><![CDATA[<%= item.title %>]]></Title>
        <Description><![CDATA[<%= item.description %>]]></Description>
        <PicUrl><![CDATA[<%= item.picurl %>]]></PicUrl>
        <Url><![CDATA[<%= item.url %>]]></Url>
        </item>
    <% }) %>
    </Articles>
<% } %>
</xml>`

const reply = content => {
  return ejs.render(template, content)
}

export default {
  reply
}
