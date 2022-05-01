from common import auto_spider
from dao import zh_config_dao
from wxpy import *

logger = logging.getLogger('wx')
logger.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
sh = logging.StreamHandler()  # 输出日志到终端
sh.setLevel(logging.DEBUG)
sh.setFormatter(formatter)
logger.addHandler(sh)

# 查询文章草稿列表
def query_article_draft():
    cookie = zh_config_dao.query_config('dxck').value
    draft_all = auto_spider.get_article_draft_all(cookie)

    result = ''

    for i, item in enumerate(draft_all):
        if item['title'].startswith('Auto-'):
            result = result + item['title'] + "_" + str(item['id']) + '\n'

    return result


# 查询文章草稿内容
def query_article_draft_html(aid_list):
    cookie = zh_config_dao.query_config('dxck').value
    result = ''
    for aid in aid_list:
        draft_content = auto_spider.get_article_draft_html(aid, cookie)
        result += draft_content['content']

    return result


# 暂存
def post_question_draft(qid, content):
    cookie = zh_config_dao.query_config('dxck').value
    result = auto_spider.post_question_draft(qid, content, cookie)

    logger.info('{}'.format(result['updated_time']))

    return


if __name__ == "__main__":
    aid_list = [508000788, 508000925, 507981653]
    html = query_article_draft_html(aid_list)
    print(html)
    post_question_draft(496761455, html)
    # post_question_draft(496761455, '<p>11122123123323132131122222</p>')
