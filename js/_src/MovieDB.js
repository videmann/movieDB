class MOVIE_DB {
    constructor(params) {
        this.api_key_v3 = params.api.key_v3
        this.api_key_v4 = params.api.key_v4
        this.api_url    = 'https://api.themoviedb.org/3/'
        this.api_auth   = 'authentication/token/new'
        this.api_sess   = 'authentication/guest_session/new'

        this.session_id = ''
        this.token      = ''
        this.page = 1
    }

    async request(request, locale = 'Ru-ru') {
        try {
            let response = await fetch(`${this.api_url}${request}?api_key=${this.api_key_v3}&language=${locale}&page=${this.page}`)
            let result = await response.json()

            return result
        } catch (error) {
            throw new Error(error)
        }
    }

    async newSession() {
        this.session_id = await this.request(this.api_sess)
    }

    async newToken() {
        this.token = await this.request(this.api_auth)
    }

    auth() {
        return new Promise(async (resolve, reject) => {
            try {
                await this.newToken()
                resolve(this.token)
            } catch (error) {
                reject()
                throw new Error(error)
            }
        })
    }

    async search(request) {
        try {
            let response = await fetch(`${this.api_url}search/movie?api_key=${this.api_key_v3}&query=${request.replace(/\s/, '+')}`)
            let result = await response.json()

            return result
        } catch (error) {
            throw new Error(`Ошибка в функции поиска. ${error}`)
        }
    }

    async credits(filmID) {
        try {
            let response = await fetch(`${this.api_url}movie/${filmID}/credits?api_key=${this.api_key_v3}`)
            let result = await response.json()

            return result
        } catch (error) {
            throw new Error(`Ошибка в функции поиска. ${error}`)
        }
    }    
}