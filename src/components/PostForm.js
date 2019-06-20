import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'


class PostForm extends React.Component {
    constructor(props) {
        super(props)    

        var cookie = document.cookie
        var cookieList = cookie.split(";")
        var tokenTemp = ""
        var userTemp = ""
        
        if (cookie !== "") {
            var jsonParse = JSON.parse(cookieList[0].replace("username=",""))
            userTemp = jsonParse.username
            tokenTemp = jsonParse.token
        }

        this.state = {
            username: "",
            password: "",
            option: "",
            token: tokenTemp, 
            search: "",
            searchTemp: "",
            count: 20,
            page: 0,
            searchType: "",
            mahasiswa: [],
            prev: true,
            next: true,
            user: userTemp
        }
    }

    // Fungsi untuk meng-handle perubahan cookie
    setCookie = function (jsonUser) {
        var date = new Date();
        date.setDate(date.getDate() + 1);
        var expires = ";expires=" + date.toUTCString();
        var string = "username=" + jsonUser + expires + ";path=/;";
        document.cookie = string;
    }

    /* 
    serialize function: mengubah {obj} menjadi bentuk url-encoded
    */
    serialize = function (obj) {
        var str = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    }

    // Fungsi untuk meng-handle pilihan register
    optionRegister = e => {
        this.setState({option: "register"})
    }

    // Fungsi untuk meng-handle pilihan login
    optionLogin = e => {
        this.setState({option: "login"})
    }

    // Fungsi untuk meng-handle token
    assignToken = function(tokenTemp) {
        this.setState({token: tokenTemp})
    }

    // Fungsi untuk meng-handle list of mahasiswa
    assignMahasiswa = function(data) {
        this.setState({mahasiswa: data})
    }

    // Fungsi untuk meng-handle tipe searching "byname"
    searchTypeName = e => {
        this.setState({searchType: "byname"})
        this.setState({page: 0})        // reset page
        this.setState({searchTemp: this.state.search})
    }

    // Fungsi untuk meng-handle tipe searching "byid"
    searchTypeId = e => {
        this.setState({searchType: "byid"})
        this.setState({page: 0 })       // reset page
        this.setState({ searchTemp: this.state.search })
    }

    // Fungsi untuk meng-handle perubahan nilai pada sebuah variabel
    handleChange = e => {
        this.setState({ [e.target.name]: e.target.value })
    }

    // Fungsi untuk meng-handle tombol next
    handleNext = e => {
        this.setState({page: (this.state.page + 1)})
    }

    // Fungsi untuk meng-handle tombol previous
    handlePrev = e => {
        this.setState({page: (this.state.page - 1)})
    }

    // Fungsi untuk meng-handle searching
    handleSearch = e => {
        e.preventDefault()

        if (this.state.page > 0) {
            this.setState({prev: false})
        }
        else {
            this.setState({prev: true})
        }

        var data

        if (this.state.searchType === "byid") { // a number from 0 to 9
            data = {
                "query": this.state.searchTemp,
                "count": this.state.count,
                "page": this.state.page
            }
        }
        else {    // a Name
            data = {
                "name": this.state.searchTemp,
                "count": this.state.count,
                "page": this.state.page
            }
        }

        var getRequest = {
            method: 'GET',
            url: 'https://api.stya.net/nim/' + this.state.searchType + "?" + this.serialize(data),
            headers: {
                'Auth-Token': this.state.token
            }
        }

        axios(getRequest)
            .then(response => {
                var statusSearch = response.data.status

                // output data (handleOutput)
                if (response.data.code >= 0) {
                    if (response.data.code === 20) {
                        data.page = data.page + 1
                        getRequest.url = 'https://api.stya.net/nim/' + this.state.searchType + "?" + this.serialize(data)
                        axios(getRequest)
                            .then(response => {
                                if (response.data.code === 0) {
                                    this.setState({ next: true })
                                }
                                else if (response.data.code > 0) {
                                    this.setState({ next: false })
                                }
                            })
                            .catch(error => {
                                console.log(error)
                            })
                    }
                    else {
                        this.setState({next: true})
                    }
                    this.assignMahasiswa(response.data.payload)
                }
                else {
                    ReactDOM.render(<div>{statusSearch}</div>, document.getElementById('statusSearch'))
                    this.setState({prev: true})
                    this.setState({next: true})
                    this.setState({page: 0})
                    this.assignMahasiswa([])
                    this.setState({user: ""})
                    this.assignToken("")
                }
            })
            .catch(error => {
                console.log(error)
            })
    }

    // Fungsi untuk meng-handle register dan login
    handleRegisterLogin = e => {
        e.preventDefault()

        var data = {
            "username" : this.state.username,
            "password" : this.state.password
        }

        // Post request using axios
        var postRequest = {
            method: 'POST',
            url: 'https://api.stya.net/nim/' + this.state.option,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: this.serialize(data)
        };


        axios(postRequest)
            .then(response => {
                var statusLogin = response.data.status
                if (response.data.code === 0) {
                    ReactDOM.render(<div>{this.state.option} Successful</div>, document.getElementById('statusLogin'))
                    ReactDOM.render(<div></div>, document.getElementById('statusSearch'))
                    this.setState({user: this.state.username})
                    this.assignToken(response.data.token)

                    // jika login berhasil, set cookie dengan username dan token sekarang melalui json string
                    this.setCookie(JSON.stringify({"username": this.state.username, "token": this.state.token}))
                }
                else {
                    ReactDOM.render(<div>{statusLogin}</div>, document.getElementById('statusLogin'))
                    this.setState({user: ""})
                    this.assignToken("")
                    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                }          
            })
            .catch(error => {
                console.log(error)
            })
    }

    render() {
        const { username, password, search, mahasiswa, prev, next, user } = this.state
        /*
        if (Token.token !== "-") {
            this.assignToken(Token.token)
            this.setState({ username: Token.username })
        }
        */
        return (
            <div>
                <h1>
                    A Simple ITB NIM Finder
                </h1>
                <form onSubmit={this.handleRegisterLogin}>
                    <div>
                        <input placeholder="Username" ref="username" type="text" name="username" value={username} onChange={this.handleChange}></input>
                    </div>
                    <div>
                        <input placeholder="Password" ref="password" type="password" name="password" value={password} onChange={this.handleChange}></input>
                    </div>
                    <button className="button1" type="submit" onClick={this.optionRegister}><span>Register</span></button>
                    <button className="button1" type="submit" onClick={this.optionLogin}><span>Login</span></button>
                    <h3 id="statusLogin"> </h3>
                </form>

                <br></br>

                <form onSubmit={this.handleSearch}>
                    <h3>Welcome, {user}</h3>
                    <div>
                        <input placeholder="Type in Name or NIM..." ref="search" type="text" name="search" value={search} onChange={this.handleChange}></input>
                        <button className="button2" type="submit" onClick={this.searchTypeName}><span>Search by Name</span></button>
                        <button className="button2" type="submit" onClick={this.searchTypeId}><span>Search by NIM</span></button>
                    </div>
                    <h3 id="statusSearch"> </h3>
                    <br></br>
                    <table>
                        <tbody>
                            <tr>
                                <th>Nama</th>
                                <th>NIM TPB</th>
                                <th>NIM Jurusan</th>
                                <th>Prodi</th>
                            </tr>
                            {
                                mahasiswa.length ?
                                    mahasiswa.map(mhs => (<tr key={mhs.nim_tpb}>
                                        <td>{mhs.name}</td>
                                        <td>{mhs.nim_tpb}</td>
                                        <td>{mhs.nim_jur}</td>
                                        <td>{mhs.prodi}</td>
                                    </tr>)) :
                                    null
                            }
                        </tbody>
                    </table>
                    
                    <p align="center">
                        <button className="button3" type="submit" disabled={prev} onClick={this.handlePrev}><span>Prev</span></button>
                        <label>{this.state.page + 1}</label>
                        <button className="button4" type="submit" disabled={next} onClick={this.handleNext}><span>Next</span></button>
                    </p>
                </form>
            </div>
        )
    }
}

export default PostForm