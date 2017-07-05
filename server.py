import argparse
import pathlib
import json

import tornado.ioloop
import tornado.web
from tornado.escape import json_decode, json_encode

names = []


class IndexHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('index.html', names=names)


class InfoHandler(tornado.web.RequestHandler):
    def post(self):
        info = {'w': 1920, 'h': 1080, 'n': len(names), 'folder': folder}
        self.write(json_encode(info))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('path', help="path/to/frames/folder")
    args = parser.parse_args()

    path = pathlib.Path(args.path).expanduser().absolute()
    if not path.exists():
        print('Error: "{}" not exists'.format(path))
        print('Program exits.')
        return
    if not path.is_dir():
        print('Error: "{}" is not directory'.format(path))
        print('Program exits.')
        return

    global names
    global folder
    names = sorted(list([x.name for x in path.iterdir()]))
    folder = str(path)

    app = tornado.web.Application([
        (r'/', IndexHandler),
        (r'/info', InfoHandler),
        (r'/static/(.*)', tornado.web.StaticFileHandler, { 'path': './static' }),
        (r'/local/@(.*)', tornado.web.StaticFileHandler, { 'path': str(path) })
    ]) # yapf: disable

    app.listen(8686)
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()