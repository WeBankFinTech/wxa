import os
import json
from PIL import Image
from dHash import dHash

cwd_path = os.getcwd()
target_path = cwd_path + '\\__wxa_e2e_test__'

class DiffImages():

    def __init__(self):
        self.case_result = []
        self.dHash = dHash()

    #读取excel文件
    def FindAndDiffImgs(self):

        dirnames = self.GetDirList(cur_path = target_path, cur_type = "dir")
        for cur_dir in dirnames:
            obj = {}
            obj['case_name'] = cur_dir # 当前用例
            cur_base = target_path + "\\" + cur_dir + "\\base_screenshot\\"
            cur_replay = target_path + "\\" + cur_dir + "\\replay_screenshot\\"
            base_img_list = self.GetDirList(cur_path = cur_base, cur_type = "file")
            replay_img_list = self.GetDirList(cur_path = cur_replay, cur_type = "file")
            for base_img in base_img_list:
                img_obj = {'name': base_img}
                exist_replay = replay_img_list.count(base_img)
                if exist_replay > 0:
                    image1 = self.GetImage(img_path = cur_base + base_img)
                    image2 = self.GetImage(img_path = cur_replay + base_img)
                    diff_result = self.dHash.classfiy_dHash(image1=image1, image2=image2, size=(414, 688))
                    img_obj['diff_result'] = diff_result
                else:
                    diff_result = -1 #图片不存在，对比失败
                    img_obj['diff_result'] = diff_result
                obj[base_img] = img_obj
            self.case_result.append(obj)
        print(self.case_result)
        return self.WriteFile()
        

    #上报Case结果
    # def WriteJsonFile(self, params):

    def GetImage(self, img_path):
        return Image.open(img_path)

    def GetDirList(self, cur_path, cur_type):
        # 所有文件及目录
        names = os.listdir(cur_path)
        dirnames = None
        if cur_type == 'dir':
            # 测试用例目录
            dirnames = [name for name in names if os.path.isdir(os.path.join(cur_path, name)) and name != '.cache']
        elif cur_type == 'file':
            dirnames = [name for name in names if os.path.isfile(os.path.join(cur_path, name))]
        print(dirnames)
        return dirnames
    def WriteFile(self):
        json_path = target_path+ "\\diff_result.json"
        if os.path.exists(json_path):
            os.remove(json_path)  
        with open(json_path, 'xt', encoding='utf-8') as f:
            f.write(json.dumps(self.case_result,ensure_ascii=False,sort_keys=True, indent=4))




if __name__ == '__main__':
    di = DiffImages()
    di.FindAndDiffImgs()