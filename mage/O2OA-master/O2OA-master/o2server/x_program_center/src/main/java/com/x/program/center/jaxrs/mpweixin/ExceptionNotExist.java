package com.x.program.center.jaxrs.mpweixin;

import com.x.base.core.project.exception.LanguagePromptException;
import com.x.base.core.project.exception.PromptException;

/**
 * Created by fancyLou on 3/12/21.
 * Copyright © 2021 O2. All rights reserved.
 */
public class ExceptionNotExist extends LanguagePromptException {

    private static final long serialVersionUID = 4862362281353270832L;

    ExceptionNotExist() {
        super("对象不存在");
    }
}
