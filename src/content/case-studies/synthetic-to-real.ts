// Every claim here comes from the AdityaJadhav17/Synthetic-to-Real-Object-Detection
// README and files at a4fc71c (2025-09-08), its commit authors, the
// competition's public overview page (name, task, metric, leaderboard split)
// or the card in projects.ts. Scores are the competition leaderboard read
// 2026-11-12 without signing in (private 0.91750, public 0.90738); the README's
// table swaps the two labels. Training settings are runs/detect/train/args.yaml;
// validation scores are epoch 8 of runs/detect/train/results.csv. Image counts
// are data/train, data/val and submission.csv (164 rows, five "no box").
// "Solo entry" is Aditya's own account (2026-11-12); all ten commits are his.
// The notes at the end of train.py come from the organizers' starter kit, so
// they are not quoted as his findings. No source records a "22%" figure.
import type { CaseStudy } from '../case-study'

const study: CaseStudy = {
  slug: 'synthetic-to-real',
  title: 'Synthetic-to-Real Object Detection on Kaggle',
  description:
    'A YOLOv8s detector trained only on synthetic images of a cereal box and scored on real photos in a Kaggle challenge: mAP@50 0.9175 private, 0.9074 public.',
  facts: {
    result: 'mAP@50 0.9175 private, 0.9074 public',
    role: 'Everything: training, tuning, submission',
    team: 'Solo',
  },
  dateCreated: '2025-08',
  published: '2026-11-13',
  keywords: [
    'Synthetic to Real Object Detection Challenge',
    'sim-to-real',
    'synthetic data',
    'object detection',
    'Kaggle',
    'YOLOv8',
    'Ultralytics',
    'mAP@50',
    'transfer learning',
    'PyTorch',
    'Python',
  ],
  ogImage: {
    src: '/og/synthetic-to-real.png',
    alt: 'Dark card with an AJ monogram, the title "Synthetic-to-Real Object Detection." and the line "mAP@50 0.9175 private, 0.9074 public". Below it: Aditya Jadhav and adityajadhav.dev.',
  },
  sections: [
    {
      heading: 'The problem',
      body: [
        {
          p: 'The Synthetic to Real Object Detection Challenge on Kaggle, with a dataset from Duality AI, asks for a detector that finds a Cheerios box in real photos after training on synthetic images only. Models trained that way often fail in real-world conditions, and the competition calls this the Sim2Real gap.',
        },
        {
          p: 'Kaggle scores entries by mAP@50, mean average precision in which a predicted box counts as correct when it overlaps the true box by at least half (IoU 0.5). The public leaderboard scores half of the real test images; the private leaderboard scores the other half and sets the final ranking.',
        },
      ],
    },
    {
      heading: 'What I built',
      body: [
        {
          p: 'This was a solo entry, and all ten commits in the repository are mine. The organizers gave every entrant a starter kit: a YOLOv8 training script, a prediction script, a script that turns predictions into the submission file, and batch files that set up a Conda environment. The repository holds my versions of those files, the training run behind the submission, its predictions and the submitted CSV.',
        },
        {
          p: 'I fine-tuned YOLOv8s, the small YOLOv8 model, from its pretrained weights on the 431 synthetic training images, checking it after each epoch against 69 synthetic validation images.',
        },
      ],
    },
    {
      heading: 'How it works',
      body: [
        {
          p: 'The saved run trained for eight epochs on a CPU at 640 pixels, in batches of eight, with the Adam optimizer at a learning rate of 0.0001 and every object treated as one class. It took about 103 minutes. Augmentation is the Ultralytics set: mosaic at a probability of 0.3, mixup at 0.1, random shifts in hue, saturation and brightness, translation, scaling and horizontal flips. The rotation setting stayed at zero degrees.',
        },
        {
          p: 'Prediction runs the best checkpoint over each real test photo with a confidence threshold of 0.015 and writes every box as a class, a confidence, a centre, a width and a height, scaled to the image. The threshold is low on purpose: mAP ranks boxes by confidence, so a weak box that turns out right still counts.',
        },
        {
          p: 'The conversion script keeps only prediction files that match a test image, drops any line without six numbers, and writes "no box" for a photo with no detection. Five of the 164 test photos got none.',
        },
      ],
    },
    {
      heading: 'Results',
      body: [
        {
          table: {
            caption: 'Kaggle leaderboard scores, mAP@50 on real photos',
            head: ['Leaderboard', 'mAP@50'],
            rows: [
              ['Private (final ranking)', '0.9175'],
              ['Public', '0.9074'],
            ],
          },
        },
        {
          p: 'On the 69 synthetic validation images, the last epoch reached mAP@50 0.9935 and mAP@50-95 0.9746, against 0.9175 and 0.9074 on real photos.',
        },
      ],
    },
    {
      heading: 'What it gets wrong',
      body: [
        {
          ul: [
            'The validation images are synthetic, so the score during training says little about real photos. The repository has no labelled real images to check against before submitting.',
            'I also tried YOLOv8n and YOLOv8m and stronger augmentation. The repository keeps one run, of YOLOv8s, so it cannot show what those experiments found.',
            "It does not keep the organizers' original starter scripts either, so it cannot show which lines of the training, prediction and conversion scripts are mine.",
            'Eight epochs on a CPU is a short run, and with one run there is no measure of how much the score moves between runs.',
          ],
        },
      ],
    },
    {
      heading: 'Stack',
      body: [
        {
          ul: [
            'Python 3.10 in a Conda environment',
            'PyTorch',
            'Ultralytics YOLOv8 (YOLOv8s, pretrained weights)',
            'pandas for the submission CSV',
          ],
        },
      ],
    },
  ],
}

export default study
