(define (factorial base)
    (cond ((= base 1) 1)
          (else (* base (factorial (- base 1))))))
(print (factorial 5))