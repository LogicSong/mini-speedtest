/*
 * @Author: songyipeng
 * @Date: 2022-01-20 18:54:45
 */
// index.ts
// 获取应用实例
const app = getApp<IAppOption>();

Page({
  data: {
    // canvasWidth: app.globalData.screenWidth,
    imgInfo: null,
    imgUrl: null, //上传的图片地址
    orignImgInfo: null,
    compressedImgInfo: null,
    canvasSize: {
      width: "200px",
      height: "200px",
    },
    motto: "Hello World",
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
    canIUseGetUserProfile: false,
    canIUseOpenData:
      wx.canIUse("open-data.type.userAvatarUrl") &&
      wx.canIUse("open-data.type.userNickName"), // 如需尝试获取用户信息可改为false
  },
  // 选择上传图片的方式
  chooseUploadWay() {
    const that = this;
    wx.showActionSheet({
      itemList: ["拍照", "从手机相册选择"],
      success(res) {
        if (res.tapIndex === 0) {
          wx.chooseMedia({
            count: 1,
            mediaType: ["image"],
            sourceType: ["camera"],
            sizeType: ["original"],
            camera: "back",
            success(res) {
              console.log(res.tempFiles.tempFilePath);
              console.log(res.tempFiles.size);
            },
          });
        } else {
          wx.showToast({
            title: "100",
          });
          wx.chooseMedia({
            count: 1,
            mediaType: ["image"],
            sourceType: ["album"],
            sizeType: ["original"],
            success(res) {
              // 获取图片信息
              wx.getImageInfo({
                src: res.tempFiles[0].tempFilePath,
                success(res2) {
                  const imgInfo = {
                    src: res.tempFiles[0].tempFilePath,
                    width: res2.width,
                    height: res2.height,
                    type: res2.type,
                  };
                  wx.getFileInfo({
                    filePath: res.tempFiles[0].tempFilePath,
                    success(res3) {
                      imgInfo.size = res3.size;
                      that.setData({ orignImgInfo: imgInfo });
                      // 绘制图片
                      setTimeout(function () {
                        that.drawCanvas(imgInfo);
                      }, 10);
                    },
                  });
                },
                fail(e) {
                  wx.showToast({
                    title: "wx.getImageInfo失败:" + e.errMsg,
                  });
                },
              });
            },
            fail(e) {
              wx.showToast({
                title: "chooseMedia失败:" + e.errMsg,
              });
            },
          });
        }
      },
      fail(res) {
        console.log(res.errMsg);
      },
    });
  },

  // 绘制图片
  drawCanvas(imgInfo, quality = 0.96) {
    const that = this;
    const query = wx.createSelectorQuery();
    query
      .select("#compressCanvasId")
      .fields({ node: true, size: true })
      .exec((res) => {
        // canvas实例
        const canvas = res[0].node;
        // canvas上下文
        const ctx = canvas.getContext("2d");
        //关键代码
        canvas.width = imgInfo.width;
        canvas.height = imgInfo.height;
        // ctx.scale(app.glabalData.pixelRatio, app.glabalData.pixelRatio);
        that.setData({
          canvasSize: {
            width: imgInfo.width / app.glabalData.pixelRatio,
            height: imgInfo.height / app.glabalData.pixelRatio,
          },
        });

        // 创建图片
        let img = canvas.createImage();
        img.src = imgInfo.src;
        /*
        img.onload = (e) => {
          let cW = imgInfo.width;
          let cH = imgInfo.height;
          let sx = 0;
          let sy = 0;
          const ratio = cW / cH;
          // 当宽高大于画布宽高时，设置为画布宽高
          if (cW > canvas.width) {
            cW = canvas.width;
            cH = cW / ratio;
          }
          if (cH > canvas.height) {
            cH = canvas.height;
            cW = cH * ratio;
          }
          // 居中
          if (cW < canvas.width) {
            sx = (canvas.width - cW) / 2;
          }
          if (cH < canvas.height) {
            sy = (canvas.height - cH) / 2;
          }

          ctx.drawImage(img, 0, 0, imgInfo.width, imgInfo.height);

          // 添加文字
          ctx.fillStyle = "#aaa";
          ctx.font = "16px serif";
          ctx.textAlign = "center";
          ctx.fillText("点击更换图片", canvas.width / 2, canvas.height / 2);
        };
        */
        img.onload = function (e) {
          wx.showToast({
            title: "333",
          });
          ctx.drawImage(img, 0, 0, imgInfo.width, imgInfo.height);

          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height,
            destWidth: canvas.width,
            destHeight: canvas.height,
            fileType: "jpg",
            quality,
            canvasId: "compressCanvasId",
            canvas: canvas,
            fail: (e) => {
              wx.showToast({
                title: e.errMsg,
              });
            },
            success: function success(res) {
              wx.getImageInfo({
                src: res.tempFilePath,
                success(res2) {
                  const compressedImgInfo = {
                    src: res.tempFilePath,
                    width: res2.width,
                    height: res2.height,
                    type: res2.type,
                  };
                  wx.getFileInfo({
                    filePath: res.tempFilePath,
                    success(res3) {
                      compressedImgInfo.size = res3.size;
                      wx.showModal({
                        title: "提示",
                        content: `origin-size:${that.data.orignImgInfo.size}; compressed-size: ${compressedImgInfo.size};`,
                      });
                      that.setData({ compressedImgInfo });
                    },
                  });
                },
              });
              // that.setData()
            },
          });
        };
      });
  },

  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: "../logs/logs",
    });
  },
  onLoad() {
    // @ts-ignore
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
      });
    }
  },
  getUserProfile() {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: "展示用户信息", // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res);
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
        });
      },
    });
  },
  getUserInfo(e: any) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e);
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true,
    });
  },
});
