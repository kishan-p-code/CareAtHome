import sys
import os
import importlib.util

class PurePythonLoader(importlib.abc.MetaPathFinder):
    """
    Ensures pure Python implementations are loaded for Cython modules when
    Windows Application Control / AppLocker blocks compiled .pyd DLLs.
    """
    def find_spec(self, fullname, path, target=None):
        if '_cy' in fullname and path:
            mod_name = fullname.split('.')[-1]
            for p in path:
                py_file = os.path.join(p, mod_name + '.py')
                if os.path.isfile(py_file):
                    return importlib.util.spec_from_file_location(fullname, py_file)
        return None

if not any(isinstance(f, PurePythonLoader) for f in sys.meta_path):
    sys.meta_path.insert(0, PurePythonLoader())

