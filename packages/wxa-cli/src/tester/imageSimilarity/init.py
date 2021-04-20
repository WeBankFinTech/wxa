import os
import sys
import json
from PIL import Image
from dHash import dHash

cwd_path = os.getcwd()
target_path = cwd_path + '\\__wxa_e2e_test__'

class DiffImages():

    def __init__(self, argv):
        self.case_result = {}
        self.dHash = dHash()
        if len(argv) > 2: # 获取Cmd参数
            # myslice = slice(1, len(argv))
            # self.argv = argv[myslice]
            self.time_stamp = argv[1]
            self.argv = argv[2].split('-')

    '''
    开始对比
    '''
    def start(self): 
        print('start image diff')
        self.case_result[self.time_stamp] = self.FindAndDiffImgs(ins = self.time_stamp)
        self.WriteFile(out_dir = self.time_stamp)
        print('image diff finished')

    '''
    读取img文件列表
    '''
    def FindAndDiffImgs(self, ins):
        cur_ins = []
        dirnames = self.GetDirList(cur_path = target_path, cur_type = "dir")
        dirnames = filter(self.FilterFun, dirnames)
        for cur_dir in dirnames:
            obj = {}
            obj['case_name'] = cur_dir # 当前用例
            # 拼接路径
            cur_base = target_path + "\\" + cur_dir + "\\base_screenshot\\"
            cur_replay = target_path + "\\.replay_result\\" + ins + "\\" + cur_dir +"\\screenshot\\"
            # 拿到目录下的图片列表
            base_img_list = self.GetDirList(cur_path = cur_base, cur_type = "file")
            replay_img_list = self.GetDirList(cur_path = cur_replay, cur_type = "file")
            # 遍历对比
            for base_img in base_img_list:
                img_obj = {'name': base_img}
                exist_replay = replay_img_list.count(base_img)
                if exist_replay > 0:
                    image1 = self.GetImage(img_path = cur_base + base_img)
                    image2 = self.GetImage(img_path = cur_replay + base_img)
                    diff_result = self.dHash.classfiy_dHash(image1=image1, image2=image2, size=(414, 688))
                    print(cur_dir+"\\"+base_img + " diff result is: " + str(diff_result))
                    img_obj['diff_result'] = diff_result
                else:
                    diff_result = -1 #图片不存在，对比失败
                    img_obj['diff_result'] = diff_result
                obj[base_img] = img_obj
            cur_ins.append(obj)
        # print(cur_ins)
        return cur_ins
        
    '''
    获取Img实例
    '''
    def GetImage(self, img_path):
        return Image.open(img_path)

    '''
    获取用例列表
    '''
    def GetDirList(self, cur_path, cur_type):
        # 所有文件及目录
        names = os.listdir(cur_path)
        dirnames = None
        if cur_type == 'dir':
            # 测试用例目录
            dirnames = [name for name in names if os.path.isdir(os.path.join(cur_path, name)) and name != '.cache' and name != '.replay_result']
        elif cur_type == 'file':
            dirnames = [name for name in names if os.path.isfile(os.path.join(cur_path, name))]
        # print(dirnames)
        return dirnames
        
    '''
    生成结果
    '''
    def WriteFile(self, out_dir):
        json_path = target_path + "\\.replay_result\\" + out_dir + "\\diff_result.json"
        if os.path.exists(json_path):
            os.remove(json_path)  
        with open(json_path, 'xt', encoding='utf-8') as f:
            f.write(json.dumps(self.case_result,ensure_ascii=False,sort_keys=True, indent=4))

    def FilterFun(self, item):
        if item in self.argv:
            return True
        return False


if __name__ == '__main__':
    args = sys.argv
    di = DiffImages(args)
    di.start()