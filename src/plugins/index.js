const HtmlWebpackPlugin = require('safe-require')('html-webpack-plugin');
const lottieConfig = require("../../lottieConfig.json");
const ajax = require('../utils/ajax');
const request = require('request');
const path = require('path');

const preloadDirective = {
    '.js': 'script',
    '.css': 'style',
    '.woff': 'font',
    '.woff2': 'font',
    '.jpeg': 'image',
    '.jpg': 'image',
    '.gif': 'image',
    '.png': 'image',
    '.svg': 'image'
  };

const IS = {
    isDefined: v => v !== undefined,
    isObject: v => v !== null && v !== undefined && typeof v === 'object' && !Array.isArray(v),
    isBoolean: v => v === true || v === false,
    isNumber: v => v !== undefined && (typeof v === 'number' || v instanceof Number) && isFinite(v),
    isString: v => v !== null && v !== undefined && (typeof v === 'string' || v instanceof String),
    isArray: v => Array.isArray(v),
    isFunction: v => typeof v === 'function'
  };
  
  const { isDefined, isObject, isBoolean, isNumber, isString, isArray, isFunction } = IS;

   

  class LottieWebpackPlugin{


      constructor(options){
          this.options=options || {};
      }

      addLinks= async(compilation, htmlPluginData)=>{
          let imgArray=[];
          if(lottieConfig){
              for(let i=0;i<lottieConfig.length;i++){
               const result=  await this.requestLottie(lottieConfig[i]);
               imgArray.push(...result);
              }
          }
          Array.prototype.push.apply(htmlPluginData.headTags, imgArray.map(this.addPreloadType));
          console.log("最后=",htmlPluginData);
        return htmlPluginData;
      }

      requestLottie=  (url)=>{
         return new Promise((resolve,reject)=>{
            request(url,  (error, response, body)=> {
                if (!error && response.statusCode == 200) {
                  try{
                    const lottieData=JSON.parse(body);
                    const result= this.lottieParse(lottieData,url);
                    resolve(result);
                  }catch(e){
                      console.log(e);
                      reject(url+"==失败="+e);
                  }
                }else{
                    reject(url+"==失败");
                }
              })
          })
        
      }

      lottieParse=(data,url)=>{
        let urlArray=[];
        try{
            const assets=data.assets;
            const urlPre=this.getUrlPre(url);
            for(let i=0;i<assets.length;i++){
                const item=assets[i];
                if(item.p && item.u){
                    const url=`${urlPre}${item.u}${item.p}`;
                    const tag= this.createResourceHintTag(url,"preload",true);
                    urlArray.push(tag);
                }
            }
          }catch(e){
              console.log(e);
          }
          return urlArray;
      }

      getUrlPre=(url)=>{
        const lastIndex=  url.lastIndexOf("/");
        return url.substring(0,lastIndex+1);
      }

    addPreloadType =(tag)=> {
        const ext = path.extname(tag.attributes.href);
        if (preloadDirective[ext]) {
          tag.attributes.as = preloadDirective[ext];
        }
        return tag;
      }
      

   
      alterAssetTagGroups=(htmlPluginData,callback,compilation)=>{
        try {
            callback(null, this.addLinks(compilation, htmlPluginData));
        } catch (error) {
            callback(error);
        }        
      }

     

     createResourceHintTag= (url, resourceHintType, htmlWebpackPluginOptions)=> {
        return {
          tagName: 'link',
          selfClosingTag:  true || !!htmlWebpackPluginOptions.xhtml,
          attributes: {
            rel: resourceHintType,
            href: url
          }
        };
      }
  
      registerHook(compilation){
        const pluginName=this.constructor.name; 
        if (HtmlWebpackPlugin && HtmlWebpackPlugin.getHooks) {
                // HtmlWebpackPlugin >= 4
            const hooks = HtmlWebpackPlugin.getHooks(compilation);
            const htmlPlugins = compilation.options.plugins.filter(plugin => plugin instanceof HtmlWebpackPlugin);
            if (htmlPlugins.length === 0) {
                const message = "Error running html-webpack-tags-plugin, are you sure you have html-webpack-plugin before it in your webpack config's plugins?";
                throw new Error(message);
            }
            // hooks.beforeAssetTagGeneration.tapAsync(pluginName, (htmlPluginData, callback)=>{this.onBeforeHtmlGeneration(htmlPluginData, callback,compilation)});
            hooks.alterAssetTagGroups.tapAsync(pluginName, (htmlPluginData, callback)=>{this.alterAssetTagGroups(htmlPluginData, callback,compilation)});
            // hooks.beforeEmit.tapAsync(pluginName, (htmlPluginData, callback)=>{this.onAlterAssetTagGroups(htmlPluginData, callback,compilation)});
            // hooks.alterAssetTags.tapAsync(pluginName, (htmlPluginData,callback)=>{this.alterAssetTags(htmlPluginData,compilation,callback)});
            // hooks.afterEmit.tapAsync(pluginName,(htmlPluginData, callback)=>{this.onAlterAssetTagGroups(htmlPluginData, callback,compilation)});
        } else if (compilation.hooks.htmlWebpackPluginAlterAssetTags &&
            compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration) {
                // HtmlWebpackPlugin 3
                compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(pluginName,(htmlPluginData, callback)=>{this.alterAssetTagGroups(htmlPluginData, callback,compilation)});
                // compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration.tapAsync(pluginName, (htmlPluginData, callback)=>{this.onAlterAssetTagGroups(htmlPluginData, callback,compilation)});
                // compilation.hooks.htmlWebpackPluginBeforeEmit.tapAsync(pluginName, (htmlPluginData, callback)=>{this.onAlterAssetTagGroups(htmlPluginData, callback,compilation)});
        }else{
            const message = "Error running html-webpack-tags-plugin, are you sure you have html-webpack-plugin before it in your webpack config's plugins?";
            throw new Error(message);
        }
      }

      apply(compiler){
        const htmlPluginName = isDefined(this.options.htmlPluginName) ? this.options.htmlPluginName : 'html-webpack-plugin';
        const pluginName=this.constructor.name;
          if(compiler.hooks){
              compiler.hooks.compilation.tap(pluginName,(compilation)=>{
                  this.registerHook(compilation);
              });
          }
      }
  }

  module.exports = LottieWebpackPlugin;