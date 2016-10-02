/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

//ES5

var React = require('react-native');
var Icon = require('react-native-vector-icons/Ionicons');
var sha1 = require('sha1');
var Progress = require('react-native-progress');
var ImagePicker = require('NativeModules').ImagePickerManager;

var request = require('../common/request');
var config = require('../common/config');

var StyleSheet = React.StyleSheet;
var Text = React.Text;
var View = React.View;
var ListView = React.ListView;
var SliderIOS = React.SliderIOS;
var AlertIOS = React.AlertIOS;
var TouchableOpacity = React.TouchableOpacity;
var Image = React.Image;
var AsyncStorage = React.AsyncStorage;
var Dimensions = React.Dimensions; //获取显示器的宽度

var width = Dimensions.get('window').width;

var photoOptions = {
    title: '选择头像',
    cancelButtonTitle:'取消', //取消的按钮
    takePhotoButtonTitle: '拍照', //拍照
    chooseFromLibraryButtonTitle:'选择相册', //选择相册
    quality:0.75, //图片质量
    allowsEditing:true, //允许拉伸剪裁
    noData:false,
    storageOptions: {
        skipBackup: true,
        path: 'images'
    }
};


var CLOUDINARY = {
    cloud_name: 'supersea',
    api_key: '815174356727538',
    api_secret: 'gKK0PlXoAOBSklKXlMw93lWMxpI',
    base: 'http://res.cloudinary.com/supersea',
    image:'https://api.cloudinary.com/v1_1/supersea/image/upload',
    video:'https://api.cloudinary.com/v1_1/supersea/video/upload',
    audio:'https://api.cloudinary.com/v1_1/supersea/raw/upload',
};

function avatar(id,type){

    if (id.indexOf('http') > -1){
        return id
    }

    if (id.indexOf('data:image') > -1){
        return id
    }

    return CLOUDINARY.base + '/' + type + '/upload/' + id
}




//账户页面
var Account = React.createClass({

    getInitialState: function() {

        var user = this.props.user || {};
        console.log(user);
        return {
            user:user,
            avatarProgress:0,
            avatarUploading:false
        };
    },
    componentDidMount(){
        var that = this;
        AsyncStorage.getItem('user')
            .then((data) =>{
                console.log(data);
                var user;

                if (data){
                    user = JSON.parse(data)
                }



                if (user && user.accessToken){
                    that.setState({
                        user:user
                    })
                }
            })
    },
    _pickPhoto(){

        var that = this;
        ImagePicker.showImagePicker(photoOptions, (res) => {

            if (res.didCancel) {
                return ;
            }

            var avartarData =  'data:image/jpeg;base64,' + res.data;
            var timestamp = Date.now();
            var tags = 'app,avatar';
            var folder = 'avatar';
            var signatureURL = config.api.base + config.api.signature;
            var accessToken = this.state.user.accessToken;
            request.post(signatureURL,{
                accessToken:accessToken,
                timestamp:timestamp,
                folder:folder,
                tags:tags,
                type:'avatar'
            }).catch((err)=>{
                console.log(err)
            })
                .then((data)=>{
                    console.log(data);
                    if (data && data.success){
                        var signature = 'folder=' + folder + '&tags=' + tags +
                                '&timestamp=' + timestamp + CLOUDINARY.api_secret

                        signature = sha1(signature);

                        var body = new FormData()

                        body.append('folder',folder);
                        body.append('signature',signature);
                        body.append('tags',tags);
                        body.append('timestamp',timestamp);
                        body.append('api_key',CLOUDINARY.api_key);
                        body.append('resource_type','image');
                        body.append('file',avartarData);

                        that._upload(body)
                    }
                })

        });
    },
    _upload(body){
        console.log(body);


        var xhr = new XMLHttpRequest();
        var url = CLOUDINARY.image;
        var that = this;

        this.setState({
            avatarUploading:true,
            avatarProgress:0
        });

        xhr.open('POST',url)
        xhr.onload = () =>{
            if (xhr.status !== 200){
                AlertIOS.alert('请求失败');
                console.log(xhr.responseText);
                return
            }
            if (!xhr.responseText){
                AlertIOS.alert('请求失败');
                return
            }

            var response;

            try{
                response = JSON.parse(xhr.response);
            }
            catch (e){
                console.log(e);
                console.log('parse fails')
            }

            if (response && response.public_id){
                var user =that.state.user;
                user.avatar = response.public_id;

                that.setState({
                    user:user,
                    avatarUploading:false,
                    avatarProgress:0

                });

                that._asyncUser(true);
            }
        };

        if (xhr.upload){
            xhr.upload.onprogress = (event) =>{
                if (event.lengthComputable){
                    var percent = Number((event.loaded / event.total).toFixed(2));

                    that.setState({
                        avatarProgress:percent
                    })
                }
            }
        }

        xhr.send(body);

    },
    _asyncUser(isAvatar){
        var that = this;
        var user = this.state.user;

        if (user && user.accessToken){
            var url = config.api.base + config.api.update;

            request.post(url,user)
                .then((data) =>{
                    if (data && data.success){
                        var user = data.data

                        if (isAvatar){
                            AlertIOS.alert('头像更新成功');
                        }

                        that.setState({
                            user:user
                        },function(){
                            AsyncStorage.setItem('user',JSON.stringify(user));
                        })
                    };
                })
        }

    },
    render() {
        var user = this.state.user;
        console.log(user.avatar)
        return (
            <View style={styles.container}>
                <View style={styles.toolbar}>
                    <Text style={styles.toolbarTitle}>我的账号</Text>
                </View>

                {
                    user.avatar
                    ?

                        <TouchableOpacity onPress={this._pickPhoto} style={styles.avatarContainer}>
                            <Image style={styles.avatarContainer}
                                   source={{uri: avatar(user.avatar,'image')}}
                            >
                                <View style={styles.avatarBox}>

                                    {
                                        this.state.avatarUploading
                                            ?
                                            <Progress.Circle
                                                size={75}
                                                showsText={true}
                                                color={'#ee735c'}
                                                progress={this.state.avatarProgress}
                                            />
                                            :
                                            <Image
                                                source={{uri: avatar(user.avatar,'image')}}
                                                style={styles.avatar}
                                            >
                                            </Image>

                                    }

                                </View>
                                <Text style={styles.avatarTip}>戳这里换头像</Text>
                            </Image>

                        </TouchableOpacity>
                    :
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarTip}>添加狗狗头像</Text>
                            <TouchableOpacity onPress={this._pickPhoto} style={styles.avatarBox}>
                                {
                                    this.state.avatarUploading
                                    ?
                                        <Progress.Circle
                                            size={75}
                                            showsText={true}
                                            color={'#ee735c'}
                                            progress={this.state.avatarProgress}
                                        />
                                    :
                                        <Icon name="ios-cloud-upload-outline" style={styles.plusIcon}/>

                                }
                            </TouchableOpacity>
                        </View>
                }

            </View>

        );
    }
});


var styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    toolbar:{
      flexDirection:'row',
        padding:25,
        paddingBottom:12,
        backgroundColor:'#ee735c'
    },
    toolbarTitle:{
      flex:1,
        fontSize:16,
        color:'#fff',
        textAlign:'center',
        fontWeight:'600'
    },
    avatarContainer:{
      width:width,
        height:140,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#666'
    },
    avatarBox:{
        marginTop:15,
        alignItems:'center',
        justifyContent:'center'
    },
    avatarTip:{
        color:'#fff',
        backgroundColor:'transparent',
        fontSize:14
    },
    avatar:{
        marginBottom:15,
        width:width * 0.2,
        height:width * 0.2,
        resizeMode:'cover',
        borderRadius:width * 0.1 ,
    },
    plusIcon:{
        padding:20,
        paddingLeft:25,
        paddingRight:25,
        color:'#999',
        fontSize:25,
        backgroundColor:'#fff',
        borderRadius:8,
    }
});

module.exports = Account;