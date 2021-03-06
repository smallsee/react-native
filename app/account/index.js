/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

//ES5
import Button from 'react-native-button';
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
var Modal = React.Modal;
var TextInput = React.TextInput;
var AlertIOS = React.AlertIOS;
var TouchableOpacity = React.TouchableOpacity;
var Image = React.Image;
var AsyncStorage = React.AsyncStorage;
var Dimensions = React.Dimensions; //获取显示器的宽度

var width = Dimensions.get('window').width;

var photoOptions = {
    title: '选择头像',
    cancelButtonTitle: '取消', //取消的按钮
    takePhotoButtonTitle: '拍照', //拍照
    chooseFromLibraryButtonTitle: '选择相册', //选择相册
    quality: 0.75, //图片质量
    allowsEditing: true, //允许拉伸剪裁
    noData: false,
    storageOptions: {
        skipBackup: true,
        path: 'images'
    }
};




function avatar(id, type) {

    if (id.indexOf('http') > -1) {
        return id
    }

    if (id.indexOf('data:image') > -1) {
        return id
    }

    if (id.indexOf('avatar/') > -1){
      return CLOUDINARY.base + '/' + type + '/upload/' + id
    }

    return 'http://oeh9bympq.bkt.clouddn.com/' + id


}


//账户页面
var Account = React.createClass({

    getInitialState: function () {

        var user = this.props.user || {};
        console.log(user);
        return {
            user: user,
            avatarProgress: 0,
            avatarUploading: false,
            modalVisible: false
        };
    },
    _edit(){
        this.setState({
            modalVisible: true
        })
    },
    _closeModal(){
        this.setState({
            modalVisible: false
        })
    },
    componentDidMount(){
        var that = this;
        AsyncStorage.getItem('user')
            .then((data) => {
                console.log(data);
                var user;

                if (data) {
                    user = JSON.parse(data)
                }


                if (user && user.accessToken) {
                    that.setState({
                        user: user
                    })
                }
            })
    },
  _getQiniuToken(){
    //七牛
    var accessToken = this.state.user.accessToken;
    var signatureURL = config.api.base + config.api.signature;
    return request.post(signatureURL, {
      accessToken: accessToken,
      type:'avatar',
      cloud:'qiniu',
    }).catch((err)=> {
      console.log(err)
    })
  },
    _pickPhoto(){

        var that = this;
        ImagePicker.showImagePicker(photoOptions, (res) => {

            if (res.didCancel) {
                return;
            }

            var avartarData = 'data:image/jpeg;base64,' + res.data;


          //七牛
          var uri = res.uri;

          that._getQiniuToken()
            .then((data) =>{

                if (data && data.success) {

                  var token = data.data.token;
                  var key = data.data.key;

                  var body = new FormData();

                  body.append('token', token);
                  body.append('key', key);
                  body.append('file', {
                    type:'image/jpeg',
                    uri:uri,
                    name:key
                  });

                  that._upload(body)
                }

            });

          // request.post(signatureURL, {
          //   accessToken: accessToken,
          //   timestamp: timestamp,
          //   key: key,
          //   type: 'avatar'
          // }).catch((err)=> {
          //   console.log(err)
          // })
          //   .then((data)=> {
          //     if (data && data.success) {
          //
          //       var signature = data.data;
          //       console.log(signature);
          //
          //       var body = new FormData();
          //
          //       body.append('folder', folder);
          //       body.append('signature', signature);
          //       body.append('tags', tags);
          //       body.append('timestamp', timestamp);
          //       body.append('api_key', config.cloudinary.api_key);
          //       body.append('resource_type', 'image');
          //       body.append('file', avartarData);
          //
          //       that._upload(body)
          //     }
          //   })
        });
    },
    _upload(body){
        var xhr = new XMLHttpRequest();
        var url = config.qiniu.upload;
        var that = this;

        console.log(body);
        this.setState({
            avatarUploading: true,
            avatarProgress: 0
        });

        xhr.open('POST', url)
        xhr.onload = () => {
            if (xhr.status !== 200) {
                AlertIOS.alert('请求失败');
                console.log(xhr.responseText);
                return
            }
            if (!xhr.responseText) {
                AlertIOS.alert('请求失败');
                return
            }

            var response;

            try {
                response = JSON.parse(xhr.response);
            }
            catch (e) {
                console.log(e);
                console.log('parse fails')
            }

            console.log(response);

            if (response){
              var user = that.state.user;
              if (response.public_id){
                user.avatar = response.public_id;
              }
              if (response.key){
                user.avatar = response.key;
              }
              that.setState({
                user: user,
                avatarUploading: false,
                avatarProgress: 0

              });
            }





            that._asyncUser(true);

        };

        if (xhr.upload) {
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    var percent = Number((event.loaded / event.total).toFixed(2));

                    that.setState({
                        avatarProgress: percent
                    })
                }
            }
        }

        xhr.send(body);

    },
    _asyncUser(isAvatar){
        var that = this;
        var user = this.state.user;
        if (user && user.accessToken) {
            var url = config.api.base + config.api.update;
            console.log(url)
            request.post(url,user).then((data) => {
                    if (data && data.success) {

                        var user = data.data;

                        if (isAvatar) {
                            AlertIOS.alert('头像更新成功');
                        }

                        that.setState({
                            user: user
                        }, function () {
                            that._closeModal();
                            AsyncStorage.setItem('user', JSON.stringify(user));
                        })
                    }

                })
        }

    },
    _changUserState(key, value){
        var user = this.state.user;

        user[key] = value;
        this.setState({
            user: user
        })

    },
    _submit(){
        this._asyncUser();
    },
    _logout(){
        this.props.logout();
    },
    render() {
        var user = this.state.user;

        return (
            <View style={styles.container}>
                <View style={styles.toolbar}>
                    <Text style={styles.toolbarTitle}>我的账号</Text>
                    <Text style={styles.toolbarExtra} onPress={this._edit}>编辑</Text>
                </View>

                {
                    user.avatar
                        ?

                        <TouchableOpacity onPress={this._pickPhoto} style={styles.avatarContainer}>
                            <Image style={styles.avatarContainer}
                                   source={{uri: avatar(user.avatar, 'image')}}
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
                                                source={{uri: avatar(user.avatar, 'image')}}
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

                <Modal
                    animated={true}
                    visible={this.state.modalVisible}
                >
                    <View style={styles.modalContainer}>
                        <Icon
                            onPress={this._closeModal}
                            name="ios-close-outline"
                            style={styles.closeIcon}/>
                        <View style={styles.fieldItem}>
                            <Text style={styles.label}>昵称:</Text>
                            <TextInput
                                placeholder={'输入你的昵称'}
                                style={styles.inputField}
                                autoCapitalize={'none'}
                                autoCorrect={false}
                                defaultValue={user.nickname}
                                onChangeText={(text)=> {
                                    this._changUserState('nickname', text)
                                }}
                            />
                        </View>

                        <View style={styles.fieldItem}>
                            <Text style={styles.label}>品种:</Text>
                            <TextInput
                                placeholder={'狗狗的品种'}
                                style={styles.inputField}
                                autoCapitalize={'none'}
                                autoCorrect={false}
                                defaultValue={user.breed}
                                onChangeText={(text)=> {
                                    this._changUserState('breed', text)
                                }}
                            />
                        </View>

                        <View style={styles.fieldItem}>
                            <Text style={styles.label}>年龄:</Text>
                            <TextInput
                                placeholder={'年龄'}
                                style={styles.inputField}
                                autoCapitalize={'none'}
                                autoCorrect={false}
                                defaultValue={user.age}
                                onChangeText={(text)=> {
                                    this._changUserState('age', text)
                                }}
                            />
                        </View>


                        <View style={styles.fieldItem}>
                            <Text style={styles.label}>性别:</Text>
                            <Icon.Button
                                onPress={()=> {
                                    this._changUserState('gender', 'male')
                                }}
                                style={[
                                    styles.gender,
                                    user.gender === 'male' && styles.genderChecked
                                ]}
                                name='ios-paw'
                            >男</Icon.Button>
                            <Icon.Button
                                onPress={()=> {
                                    this._changUserState('gender', 'female')
                                }}
                                style={[
                                    styles.gender,
                                    user.gender === 'female' && styles.genderChecked
                                ]}
                                name='ios-paw-outline'
                            >女</Icon.Button>
                        </View>

                        <Button style={styles.btn}
                                onPress={this._submit}
                        >
                            保存
                        </Button>
                    </View>
                </Modal>

                <Button style={styles.btn}
                        onPress={this._logout}
                        >
                    登出
                </Button>

            </View>

        );
    }
});


var styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    toolbar: {
        flexDirection: 'row',
        padding: 25,
        paddingBottom: 12,
        backgroundColor: '#ee735c'
    },
    toolbarTitle: {
        flex: 1,
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600'
    },
    toolbarExtra: {
        position: 'absolute',
        right: 10,
        top: 26,
        color: '#fff',
        textAlign: 'right',
        fontWeight: '600',
        fontSize: 14

    },
    avatarContainer: {
        width: width,
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#666'
    },
    avatarBox: {
        marginTop: 15,
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatarTip: {
        color: '#fff',
        backgroundColor: 'transparent',
        fontSize: 14
    },
    avatar: {
        marginBottom: 15,
        width: width * 0.2,
        height: width * 0.2,
        resizeMode: 'cover',
        borderRadius: width * 0.1,
    },
    plusIcon: {
        padding: 20,
        paddingLeft: 25,
        paddingRight: 25,
        color: '#999',
        fontSize: 25,
        backgroundColor: '#fff',
        borderRadius: 8,
    },

    modalContainer: {
        flex: 1,
        paddingTop: 50,
        backgroundColor: '#fff'
    },
    fieldItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "center",
        height: 50,
        paddingLeft: 15,
        paddingRight: 15,
        borderColor: '#eee',
        borderBottomWidth: 1,
    },
    label: {
        color: '#ccc',
        marginRight: 10,
        textAlign: 'left'
    },
    inputField: {
        flex: 1,
        height: 50,
        color: '#666',
        fontSize: 14
    },
    closeIcon: {
        position: 'absolute',
        width: 40,
        height: 40,
        fontSize: 32,
        right: 10,
        top: 30,
        color: '#ee735c'
    },
    gender: {
        backgroundColor: '#ccc'
    },
    genderChecked: {
        backgroundColor: '#ee735c'
    },
    btn: {
        padding: 10,
        marginTop: 25,
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: 'transparent',
        borderColor: '#ee735c',
        borderWidth: 1,
        borderRadius: 4,
        color: '#ee735c'
    }

});

module.exports = Account;