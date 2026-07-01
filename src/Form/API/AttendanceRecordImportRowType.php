<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Form\API;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

final class AttendanceRecordImportRowType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder->add('date', TextType::class, [
            'constraints' => [
                new Assert\NotBlank(),
                new Assert\Regex(pattern: '/^\d{4}-\d{2}-\d{2}$/'),
            ],
            'documentation' => [
                'type' => 'string',
                'format' => 'date',
                'example' => '2026-06-30',
            ],
        ]);
        $builder->add('clock_in', TextType::class, [
            'required' => false,
            'documentation' => [
                'type' => 'string',
                'example' => '2026-06-30 08:50:00',
            ],
        ]);
        $builder->add('clock_out', TextType::class, [
            'required' => false,
            'documentation' => [
                'type' => 'string',
                'example' => '2026-06-30 18:05:00',
            ],
        ]);
        $builder->add('external_id', TextType::class, [
            'required' => false,
            'documentation' => [
                'type' => 'string',
            ],
        ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
        ]);
    }
}
