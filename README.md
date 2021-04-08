# lottie-pre-webpack-plugin
------

由于lottie文件中包含很多资源，项目中需要用到lottie的地方比较多，lottie动画播放依赖网络比较强，该插件实现lottie图片资源预加载，一定程度上保障lottie动画的流程性。

> * 配置需要加载的lottie文件列表
> * 解析单个lottie文件中的data.json文件
> * 提取图片资源，结合webpack-html-plugin 的hooks
> * 将图片链接插入到index.html中实现预加载