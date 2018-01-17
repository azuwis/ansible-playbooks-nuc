var config = {
    motionPrefix: 'motion/',
    spriteFrames: 50
};

Vue.component('flat-pickr', VueFlatpickr);

var app = new Vue({
    el: '#app',
    template: '#app-template',
    data: {
        videos: [],
        date: 'today'
    },
    computed: {
        videosFiltered: function() {
            var vm = this;
            return this.videos.filter(function(video) {
                var date = new Date(vm.date + ' 00:00:00');
                return video.date >= date && video.date <= date.fp_incr(1);
            });
        },
        dateConfig: function() {
            var minDate = null;
            var maxDate = null;
            if(this.videos.length > 0) {
                minDate = this.videos[0].date;
                maxDate = this.videos[this.videos.length - 1].date;
            }
            return {
                minDate: minDate,
                maxDate: maxDate
            };
        }
    },
    methods: {
        update: function() {
            var vm = this;
            axios.get(config.motionPrefix)
                .then(function(response) {
                    vm.videos = response.data
                        .filter(function(file) {
                            return file.name.endsWith('.jpg') && ! file.name.endsWith('-sprite.jpg');
                        })
                        .map(function(file) {
                            var m= file.name.match(/^(\d{4})-(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})\./);
                            var date = new Date(m[1]+'-'+m[2]+'-'+m[3]+' '+m[4]+':'+m[5]+':'+m[6]);
                            var basename = config.motionPrefix + file.name.replace(/\.jpg$/, '');
                            return {
                                mp4: basename + '.mp4',
                                jpg: basename + '.jpg',
                                date: date,
                                sprite: basename + '-sprite.jpg',

                                poster: basename + '.jpg',
                                controls: false,
                                preview: false,
                                style: null
                            };
                        });
                });
        },
        play: function(video, event) {
            if (video.controls) return;
            this.reset(video);
            event.currentTarget.play();
            video.controls = true;
        },
        slide: function(video, event) {
            if (video.controls) return;
            var rect = event.target.getBoundingClientRect();
            var left = event.pageX - rect.left;
            var width = rect.right - rect.left;
            var percent = left / width;
            if (percent > 0.2 && !video.preview) return;
            video.preview = true;
            video.poster = null;
            video.style = {
                'background-image': 'url(' + video.sprite + ')',
                'background-position': '-' + Math.floor(percent * config.spriteFrames) * width + 'px'
            };
        },
        reset: function(video) {
            if (video.controls) return;
            video.poster = video.jpg;
            video.style = null;
        }
    },
    created: function() {
        this.update();
    }
});
